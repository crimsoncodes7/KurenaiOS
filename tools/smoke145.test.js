/* Kurenai OS — smoke145.test.js
   W2's Assistant fixes (quality audit AA-01, AA-02).

   The claims:

     A · UNDO ON THE CARD (AA-01). A reversible tool the Assistant ran by
         itself shows "Verified action complete" with ↶ Undo; Undo runs the
         tool's own undo (the reminder is gone), the card then says Undone
         and offers nothing more, and Activity gains a row of its own (tier
         "undo", status "executed", naming the action it reversed) — the
         executed row is never rewritten.
     B · THE THREAD FOLLOWS WHAT MATTERS (AA-02). A conversation opens at
         its newest message; what you send and an approval card are always
         brought into view; a reply that arrives while you have scrolled up
         leaves your place alone and shows "New message ↓", which takes you
         to the end.

   Run:
     npm install jsdom fake-indexeddb   (one-time)
     node tools/smoke145.test.js                                           */
"use strict";
const { boot } = require("./lib/app-harness");

const steps = [];
function step(name, fn) { steps.push([name, fn]); }
function assert(c, m) { if (!c) throw new Error(m); }
function eq(a, b, m) { if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(m + ": got " + JSON.stringify(a) + ", want " + JSON.stringify(b)); }

let app, K, doc, chatScript = [];
const $ = (s) => doc.querySelector(s);
const $$ = (s) => [...doc.querySelectorAll(s)];
function click(n) { assert(n, "nothing to click"); n.dispatchEvent(new app.window.MouseEvent("click", { bubbles: true })); }
const say = (text, delay) => (req, cb) => { const r = { text, toolCalls: [], provider: "stub", model: "stub" }; delay ? setTimeout(() => cb(null, r), delay) : cb(null, r); };
const callTools = (calls, delay) => (req, cb) => { const r = { text: "", toolCalls: calls, provider: "stub", model: "stub" }; delay ? setTimeout(() => cb(null, r), delay) : cb(null, r); };
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
async function send(text) {
  const box = $("[data-ui~='asst.composer'] textarea, textarea[data-ui~='asst.composer']") || $("[data-ui~='asst.composer-box'] textarea");
  assert(box, "the composer");
  box.value = text;
  box.dispatchEvent(new app.window.Event("input", { bubbles: true }));
  click($("[data-ui~='asst.send']"));
  await app.settle();
}
async function idle() { for (let i = 0; i < 40 && K.ai.orchestrator.isBusy(); i++) await wait(50); await app.settle(); }
/* jsdom lays nothing out: every thread scroller gets a size and a scroll
   position it keeps, from the moment it is made (so its first frame is real) */
const tops = new WeakMap();
let height = 2000;
function sizeThreads() {
  const P = app.window.HTMLElement.prototype;
  const d = (k) => Object.getOwnPropertyDescriptor(app.window.Element.prototype, k) || Object.getOwnPropertyDescriptor(P, k);
  const sh = d("scrollHeight"), ch = d("clientHeight"), st = d("scrollTop");
  const isT = (n) => n.classList && n.classList.contains("k-asst-thread") && n.isConnected;
  Object.defineProperty(P, "scrollHeight", { configurable: true, get() { return isT(this) ? height : sh.get.call(this); } });
  Object.defineProperty(P, "clientHeight", { configurable: true, get() { return isT(this) ? 400 : ch.get.call(this); } });
  Object.defineProperty(P, "scrollTop", { configurable: true,
    get() { return isT(this) ? (tops.get(this) || 0) : st.get.call(this); },
    set(v) { if (isT(this)) tops.set(this, Math.max(0, Math.min(v, height - 400))); else st.set.call(this, v); } });
}
const pos = { get top() { return tops.get($("[data-ui~='asst.thread']")) || 0; }, set top(v) { tops.set($("[data-ui~='asst.thread']"), v); } };

step("boot with a scripted model", async () => {
  app = await boot({ clock: "2026-11-16T10:00:00" });
  K = app.KOS; doc = app.document;
  K.ai.chat = function (category, request, cb) {
    const next = chatScript.shift();
    if (!next) { cb(null, { text: "…", toolCalls: [], provider: "stub", model: "stub" }); return; }
    next(request, cb);
  };
  K.show("assistant"); await app.settle();
  assert($("[data-ui~='asst.thread']"), "the Assistant page");
});

/* ---------------- A ---------------- */
step("A · a reversible action's card offers Undo, and Undo takes it back", async () => {
  chatScript = [callTools([{ id: "a", name: "todo_add_task", args: { text: "Revise BFS and DFS" } }]), say("Added it.")];
  await send("add a task to revise BFS and DFS");
  await idle();
  const made = K.reminders.all().filter((r) => r.title === "Revise BFS and DFS");
  eq(made.length, 1, "the reminder was made");
  const card = $("[data-ui~='asst.receipt']");
  assert(card, "the verified-action card");
  const undo = card.querySelector("[data-ui~='asst.receipt-undo']");
  assert(undo, "it offers Undo");
  click(undo); await app.settle(); await wait(20);
  eq(K.reminders.all().filter((r) => r.title === "Revise BFS and DFS").length, 0, "the reminder is gone");
  const card2 = $("[data-ui~='asst.receipt']");
  assert(card2.querySelector("[data-ui~='asst.receipt-undone']") && !card2.querySelector("[data-ui~='asst.receipt-undo']"), "the card says Undone and offers nothing more");
});
step("A · Activity is appended to, never rewritten", async () => {
  await wait(30);
  const q = await new Promise((r) => K.mediadb.getKV("assistant.auditQueue", (e, v) => r(v || [])));
  const ins = q.filter((x) => x.kind === "insert").map((x) => x.payload);
  const exec = ins.find((p) => p.tool === "todo_add_task" && p.tier === "reversible");
  const und = ins.find((p) => p.tier === "undo");
  assert(exec, "the action's own row");
  assert(und && und.status === "executed" && und.args_json && und.args_json.undoOf === exec.id, "an undo row naming it: " + JSON.stringify(und));
  assert(!q.some((x) => x.kind === "update" && x.payload.id === exec.id && x.payload.patch.status !== "executed" && x.payload.patch.status !== "proposed"), "the executed row is left as it was");
});
step("A · an undo runs once", async () => {
  const rc = { tool: "todo_add_task", undo: { label: "x", run: (cb) => { rc.n = (rc.n || 0) + 1; cb(null); } }, auditId: "z" };
  await new Promise((r) => K.ai.orchestrator.undoReceipt(rc, r));
  const again = await new Promise((r) => K.ai.orchestrator.undoReceipt(rc, (e) => r(e)));
  assert(again, "a second undo is refused");
  eq(rc.n, 1, "the undo ran once");
});

/* ---------------- B ---------------- */
step("B · reopened, the conversation is at its newest message", async () => {
  sizeThreads();
  K.show("home"); await app.settle();
  K.show("assistant"); await app.settle();
  await wait(40);                                    /* the frame after it is on screen */
  eq(pos.top, height - 400, "scrolled to the end");
});
step("B · what you send is brought into view", async () => {
  pos.top = 0;
  chatScript = [say("Here is the plan.", 120)];
  height = 2200;
  await send("what next?");
  eq(pos.top, height - 400, "your message is in view");
});
step("B · a reply while you read further up leaves your place and says so", async () => {
  pos.top = 300;                                     /* scrolled up before the reply lands */
  height = 2600;
  await idle(); await wait(200); await app.settle();
  eq(pos.top, 300, "your place is kept");
  const pill = $("[data-ui~='asst.new-message']");
  assert(pill && !pill.hidden, "New message ↓ is shown");
  click(pill);
  eq(pos.top, height - 400, "it takes you to the end");
  assert(pill.hidden, "and goes");
});
step("B · an approval card is brought into view", async () => {
  const r = K.reminders.add({ title: "Old task" });
  pos.top = 0;
  height = 3000;
  chatScript = [callTools([{ id: "d", name: "todo_delete_task", args: { id: r.id } }], 150)];
  await send("delete the old task");
  assert(!$("[data-ui~='asst.confirm']"), "the card has not arrived yet");
  pos.top = 0;                                       /* scrolled away before the card arrives */
  height = 3400;
  await wait(400); await app.settle();
  assert($("[data-ui~='asst.confirm']"), "the approval card");
  eq(pos.top, height - 400, "the approval card is in view");
  eq(app.errors, [], "no page errors");
});

(async () => {
  let failed = 0;
  for (const [name, fn] of steps) {
    try { await fn(); console.log("  ok   " + name); }
    catch (e) { failed++; console.log("  FAIL " + name + "\n       " + (e && e.stack || e)); }
  }
  console.log(failed ? `\n${failed} of ${steps.length} step(s) failed` : `\nall ${steps.length} steps passed`);
  process.exit(failed ? 1 : 0);
})();
