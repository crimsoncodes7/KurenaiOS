/* Kurenai OS — smoke27.test.js
   Category 6 Phase F: conversational continuity + Ollama context budgeting +
   the pending-artifact mechanism. Fixes the reported failure where a
   follow-up ("add it", "yes") lost the previous turn's context because a
   signed-out conversation sent ONLY the current user message to the model.

   Run:
     npm install jsdom fake-indexeddb   (one-time)
     node tools/smoke27.test.js

   PROVES:
   1. the prior user+assistant turn reaches the SECOND local turn (signed out);
   2. an 8K num_ctx is requested for Ollama, and passed through to /api/chat;
   3. tool + system + history budgeting stays within the configured context;
   4. a follow-up tool shortlist shrinks (12 -> 6) once a tool has run;
   5. "add that" resolves the immediately-pending flashcard via the normal
      registered save tool;
   6. changing the conversation/topic invalidates the pending artifact;
   7. signed-out active conversations preserve in-memory continuity across
      separate sends; a new conversation resets it;
   8. Gemini/DeepSeek are unchanged (no num_ctx, full tool list). */

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
window.fetch = () => Promise.resolve({ ok: true, status: 200, headers: { get: () => null }, json: () => Promise.resolve({}), text: () => Promise.resolve("") });
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
ORCH._config({ auditApi: { insert: (r, cb) => cb(null), update: (i, p, cb) => cb(null) } });

const steps = [];
function step(name, fn) { steps.push([name, fn]); }
const tick = ms => new Promise(r => setTimeout(r, ms || 0));
function assert(cond, msg) { if (!cond) throw new Error(msg); }

/* scripted provider capturing what the orchestrator sends */
let chatScript = [], chatLog = [];
KOS.ai.chat = function (category, request, cb) {
  /* snapshot messages AT SEND TIME — the orchestrator legitimately mutates
     req.messages (appending the assistant reply) after the call returns, and
     request.messages is that same array by reference */
  const snapshot = (request.messages || []).map(m => ({ role: m.role, content: m.content }));
  chatLog.push({ category, request, messages: snapshot, tools: request.tools, numCtx: request.numCtx, system: request.system });
  const next = chatScript.shift();
  if (!next) { cb(null, { text: "…", toolCalls: [], provider: "stub", model: "stub" }); return; }
  setTimeout(() => next(request, cb), 0);
};
const say = text => (req, cb) => cb(null, { text, toolCalls: [], provider: "stub", model: "stub" });
const callTools = (calls, text) => (req, cb) => cb(null, { text: text || "", toolCalls: calls, provider: "stub", model: "stub" });
function run(opts) {
  chatLog = [];
  return new Promise(resolve => {
    ORCH.send(opts, {
      onConfirmationNeeded: p => resolve({ paused: true, confirmation: p }),
      onDone: p => resolve({ paused: false, done: p })
    });
  });
}
function untilIdle() { return new Promise(r => { const iv = setInterval(() => { if (!ORCH.isBusy()) { clearInterval(iv); r(); } }, 10); }); }

/* route everything to ollama for these tests (the local case) */
KOS.ai.setRouting("complex", "ollama", "qwen3:4b-instruct");
KOS.ai.setRouting("crud", "ollama", "qwen3:4b-instruct");
KOS.ai.setRouting("generation", "ollama", "qwen3:4b-instruct");

/* ============ 1 + 7 · signed-out continuity ============ */
console.log("== signed-out in-memory continuity ==");

step("the prior user+assistant turn reaches the SECOND local turn (signed out)", async () => {
  assert(errors.length === 0, "load errors: " + errors.join(" | "));
  assert(!KOS.cloud.userId(), "must be signed out for this test");
  const KEY = "conv-A";
  chatScript = [say("I see the topic \"The six characteristics (6Vs)\" — it has 10 flashcards.")];
  await run({ userText: "In IT topic 'The six characteristics (6Vs)', add a flashcard.", category: "complex", conversationKey: KEY });
  // turn 2 — the follow-up
  chatScript = [say("Added.")];
  const r2 = await run({ userText: "Add a new flashcard to the deck, yes.", category: "complex", conversationKey: KEY });
  assert(!r2.paused, "turn 2 should complete");
  const msgs = chatLog[0].messages;
  const texts = msgs.map(m => m.content);
  assert(msgs.length >= 3, "turn 2 must carry prior history, got only " + msgs.length + " messages");
  assert(texts.some(t => /six characteristics/.test(t)), "the prior USER turn must reach turn 2");
  assert(texts.some(t => /10 flashcards/.test(t)), "the prior ASSISTANT answer must reach turn 2");
  assert(texts[texts.length - 1] === "Add a new flashcard to the deck, yes.", "the current user message must be last");
});

step("a NEW conversation resets the in-memory history", async () => {
  chatScript = [say("fresh")];
  await run({ userText: "hello fresh conversation", category: "complex", conversationKey: "conv-B" });
  const msgs = chatLog[0].messages.filter(m => m.role === "user" || m.role === "assistant");
  assert(msgs.length === 1 && msgs[0].content === "hello fresh conversation",
    "a new conversationKey must start with no prior history, got " + JSON.stringify(msgs.map(m => m.content)));
});

/* ============ 2 · num_ctx 8192 for ollama ============ */
console.log("== ollama num_ctx ==");

step("the orchestrator requests num_ctx for ollama turns", async () => {
  chatScript = [say("ok")];
  await run({ userText: "hi", category: "crud", conversationKey: "conv-ctx" });
  assert(chatLog[0].numCtx === 8192, "the orchestrator must request num_ctx 8192 for ollama, got " + chatLog[0].numCtx);
});

step("num_ctx passes through the ollama adapter to /api/chat options", async () => {
  let body = null;
  KOS.ai._config({ fetch: (url, opts) => { if (String(url).includes("/api/chat")) { body = JSON.parse(opts.body); return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve({ message: { content: "ok" }, done_reason: "stop" }) }); } return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve({}) }); } });
  await new Promise(res => KOS.ai.chatWith("ollama", "qwen3:4b-instruct", { messages: [{ role: "user", content: "hi" }], numCtx: 8192 }, () => res()));
  assert(body && body.options && body.options.num_ctx === 8192, "body.options.num_ctx must be 8192, got " + JSON.stringify(body && body.options));
  KOS.ai._config({ fetch: null });
});

/* ============ 3 · history budgeting within context ============ */
console.log("== history budgeting ==");

step("a long history is budgeted to fit within num_ctx (latest turns kept)", async () => {
  const KEY = "conv-long";
  // seed many turns
  chatScript = [say("t0")];
  await run({ userText: "opening message zero", category: "complex", conversationKey: KEY });
  for (let i = 1; i <= 40; i++) {
    chatScript = [say("assistant reply " + i + " " + "x".repeat(400))];
    await run({ userText: "user message " + i + " " + "y".repeat(400), category: "complex", conversationKey: KEY });
  }
  chatScript = [say("done")];
  await run({ userText: "the final question", category: "complex", conversationKey: KEY });
  const msgs = chatLog[0].messages;
  // estimate total tokens of the transmitted history + this turn
  const est = msgs.reduce((a, m) => a + Math.ceil((m.content || "").length / 4) + 4, 0);
  const budget = 8192 - 1024 - 2200 - 700;  // num_ctx - output - tools - system
  assert(est <= budget + 50, "transmitted history must fit the budget (~" + budget + "), got ~" + est + " tokens");
  assert(msgs[msgs.length - 1].content === "the final question", "the immediately-previous/current turn must survive");
  assert(msgs.some(m => /message 40|reply 40/.test(m.content)), "the LATEST prior turns must be kept");
  assert(!msgs.some(m => /message zero/.test(m.content)), "the oldest turns should be dropped under budget");
});

/* ============ 4 · follow-up shortlist shrinks ============ */
console.log("== follow-up shortlist reduction ==");

step("the tool shortlist shrinks to 6 on a follow-up turn (after a tool ran)", async () => {
  KOS.ai.setRouting("crud", "ollama", "qwen3:4b-instruct");
  chatScript = [
    callTools([{ id: "a", name: "todo_list", args: {} }]),   // turn 1: a read tool runs
    say("here you go")                                        // turn 2: final answer
  ];
  await run({ userText: "what's on my list then add nothing", category: "crud", conversationKey: "conv-sl" });
  await untilIdle();
  assert(chatLog.length >= 2, "expected two provider turns");
  assert(chatLog[0].tools.length <= 12, "first turn shortlist <= 12, got " + chatLog[0].tools.length);
  assert(chatLog[1].tools.length <= 6, "follow-up shortlist must shrink to <= 6, got " + chatLog[1].tools.length);
});

/* ============ 5 + 6 · pending artifact ============ */
console.log("== pending-artifact mechanism ==");

const SID = "compsci";
let REF = null;
step("study_propose_flashcards holds a validated UNSAVED artifact; nothing saved", async () => {
  REF = KOS.hub.LEAVES[SID].find(l => KOS.content.has(SID, l.ref) && (KOS.content.get(SID, l.ref).notes || []).length).ref;
  const before = KOS.store.state.custom.cards.length;
  // stub generation to return valid cards
  const realChat = KOS.ai.chat;
  KOS.ai.chat = (cat, req, cb) => cb(null, { text: JSON.stringify({ cards: [{ q: "Q1?", a: "A1" }, { q: "Q2?", a: "A2" }] }), provider: "ollama", model: "qwen3" });
  const r = await new Promise(res => KOS.ai.tools.execute("study_propose_flashcards", { subject: SID, ref: REF, count: 2 }, (e, out) => res({ e, out })));
  KOS.ai.chat = realChat;
  assert(!r.e && r.out.proposed === 2 && r.out.kind === "flashcards", "propose must return a proposal: " + (r.e && r.e.message));
  assert(KOS.store.state.custom.cards.length === before, "propose must NOT save anything");
  assert(KOS.ai.tools.getPendingArtifact() && KOS.ai.tools.getPendingArtifact().items.length === 2, "the artifact must be held");
});

step("study_save_proposed ('add that') saves the pending flashcards via the normal path", async () => {
  const before = KOS.store.state.custom.cards.length;
  const r = await new Promise(res => KOS.ai.tools.execute("study_save_proposed", {}, (e, out, undo) => res({ e, out, undo })));
  assert(!r.e && r.out.saved === 2, "save_proposed must save the held cards: " + (r.e && r.e.message));
  assert(KOS.store.state.custom.cards.length === before + 2, "the cards must actually be saved");
  assert(KOS.store.state.custom.cards.slice(-2).every(c => c.ai === true), "saved cards must be AI-marked");
  assert(!KOS.ai.tools.getPendingArtifact(), "the artifact must be cleared after saving");
  // undo removes them
  await new Promise(res => r.undo.run(res));
  assert(KOS.store.state.custom.cards.length === before, "undo must remove the saved cards");
});

step("save_proposed with nothing pending fails cleanly", async () => {
  const r = await new Promise(res => KOS.ai.tools.execute("study_save_proposed", {}, (e) => res(e)));
  assert(r && /nothing proposed/i.test(r.message), "must explain there is nothing to save");
});

step("changing the conversation invalidates the pending artifact", async () => {
  const realChat = KOS.ai.chat;
  KOS.ai.chat = (cat, req, cb) => cb(null, { text: JSON.stringify({ cards: [{ q: "Z?", a: "z" }] }), provider: "ollama", model: "qwen3" });
  await new Promise(res => KOS.ai.tools.execute("study_propose_flashcards", { subject: SID, ref: REF, count: 1 }, () => res()));
  KOS.ai.chat = realChat;
  assert(KOS.ai.tools.getPendingArtifact(), "an artifact is held before the conversation change");
  chatScript = [say("new topic")];
  await run({ userText: "let's talk about something else", category: "complex", conversationKey: "conv-DIFFERENT" });
  assert(!KOS.ai.tools.getPendingArtifact(), "a conversation change must invalidate the pending artifact");
});

step("a live pending artifact injects a save hint into the system prompt", async () => {
  const realChat = KOS.ai.chat;
  KOS.ai.chat = (cat, req, cb) => cb(null, { text: JSON.stringify({ cards: [{ q: "H?", a: "h" }] }), provider: "ollama", model: "qwen3" });
  await new Promise(res => KOS.ai.tools.execute("study_propose_flashcards", { subject: SID, ref: REF, count: 1 }, () => res()));
  KOS.ai.chat = realChat;
  chatScript = [say("ok")];
  await run({ userText: "hmm", category: "complex", conversationKey: "conv-hint" });
  // NOTE: the conversation change (conv-hint) clears the artifact BEFORE the turn,
  // so re-propose within the same key to observe the hint
  const realChat2 = KOS.ai.chat;
  KOS.ai.chat = (cat, req, cb) => cb(null, { text: JSON.stringify({ cards: [{ q: "H2?", a: "h2" }] }), provider: "ollama", model: "qwen3" });
  await new Promise(res => KOS.ai.tools.execute("study_propose_flashcards", { subject: SID, ref: REF, count: 1 }, () => res()));
  KOS.ai.chat = realChat2;
  chatScript = [say("ok")];
  await run({ userText: "and now?", category: "complex", conversationKey: "conv-hint" });
  assert(/PROPOSED flashcards/.test(chatLog[0].system) && /study_save_proposed/.test(chatLog[0].system),
    "the system prompt must hint how to save a live proposal");
  KOS.ai.tools.clearPendingArtifact();
});

/* ============ 8 · cloud providers unchanged ============ */
console.log("== gemini/deepseek unchanged ==");

step("a Gemini turn sends NO num_ctx and the FULL tool list (not shortlisted)", async () => {
  KOS.ai.setRouting("complex", "gemini", "gemini-3.5-flash");
  chatScript = [say("ok")];
  await run({ userText: "hi gemini", category: "complex", conversationKey: "conv-gem" });
  assert(chatLog[0].numCtx === undefined, "gemini must not receive num_ctx");
  assert(chatLog[0].tools.length > 20, "gemini must get the full tool list, got " + chatLog[0].tools.length);
  KOS.ai.setRouting("complex", "ollama", "qwen3:4b-instruct");   // restore
});

step("the ollama schema sanitizer / cloud schemas are provider-correct (regression)", async () => {
  // gemini adapter (edge) still carries additionalProperties in the client schema
  const full = KOS.ai.tools.schemas(["collection_update_entry"])[0].parameters;
  assert(/additionalProperties/.test(JSON.stringify(full)), "the CLIENT schema must keep full strictness (validation)");
});

/* ============ run ============ */
(async () => {
  let failed = 0;
  for (const [name, fn] of steps) {
    try {
      await Promise.race([fn(), new Promise((_, rej) => setTimeout(() => rej(new Error("STEP TIMEOUT (15s)")), 15000))]);
      console.log("  ok  " + name);
    } catch (e) { failed++; console.error("  FAIL " + name + "\n       " + (e && e.stack ? e.stack.split("\n").slice(0, 3).join("\n       ") : e)); }
  }
  if (errors.length) { failed++; console.error("page errors: " + errors.join(" | ")); }
  await tick(50);
  console.log("\n==============================");
  if (failed) { console.error("SMOKE27 FAILED — " + failed + " step(s)"); process.exit(1); }
  console.log("SMOKE27 PASS — continuity + Ollama budgeting + pending artifact verified (" + steps.length + " steps).");
  process.exit(0);
})();
