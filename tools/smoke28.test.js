/* Kurenai OS — smoke28.test.js
   Category 6 Phase F: EXECUTION GROUNDING. Fixes the reported defect where a
   small local model (qwen3:4b) hallucinated success — wrote flashcards as
   prose without calling a tool, claimed "this has been saved" when nothing
   was written, and promised "I'll now generate…" as its final answer. The
   fixes live at the orchestrator + UI layer, NOT in the model:
     - a WRITE that actually executes produces a VERIFIED RECEIPT (real tool +
       target + result) — the only proof a mutation happened;
     - a validated-but-UNSAVED artifact is a PROPOSAL (distinct from saved),
       surfaced as a card with an explicit Save that runs the EXACT artifact;
     - completion checking: a success-claim with no write, or an action-promise
       with nothing done, gets one corrective retry then a deterministic
       correction — the user is never told something happened that didn't.

   Run:
     npm install jsdom fake-indexeddb   (one-time)
     node tools/smoke28.test.js

   PROVES:
   1. prose-only "generation" (no tool call) is NOT treated as a proposal;
   2. a FAILED save can never be described as saved (correction appended);
   3. a proposal is distinct from persisted state (held, nothing saved) until
      Save lands a real write receipt;
   4. the Save action executes the EXACT stored (and edited) artifact;
   5. a verified receipt appears ONLY after a successful write (reads produce
      none) and carries the real tool + target + summary;
   6. false success text ("this has been saved") is corrected deterministically;
   7. batch generation cannot finish after ONLY reading notes (promise-no-action);
   8. 8 requested cards yield exactly 8 validated proposals, or a clean failure
      with nothing held and nothing saved — never a partial silent save;
   9. retrieval after save returns the REAL persisted record (count + topic);
   10. Gemini/DeepSeek routing and the Phase C confirmation control are unchanged. */

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

/* ---- scripted provider: separate queues for CONVERSATION turns and nested
   GENERATION calls (genFlashcards/genQuiz call KOS.ai.chat("generation",…)
   with a structured schema). Branch on that so one stub serves both. ---- */
let chatScript = [], chatLog = [], genScript = [], genDefault = null;
KOS.ai.chat = function (category, request, cb) {
  if (request.structured || category === "generation") {
    const g = genScript.length ? genScript.shift() : genDefault;
    setTimeout(() => cb(null, { text: JSON.stringify(g), provider: "ollama", model: "qwen3:4b-instruct" }), 0);
    return;
  }
  const snapshot = (request.messages || []).map(m => ({ role: m.role, content: m.content }));
  chatLog.push({ category, request, messages: snapshot, tools: request.tools, numCtx: request.numCtx, system: request.system });
  const next = chatScript.shift();
  if (!next) { cb(null, { text: "…", toolCalls: [], provider: "stub", model: "stub" }); return; }
  setTimeout(() => next(request, cb), 0);
};
const say = text => (req, cb) => cb(null, { text, toolCalls: [], provider: "stub", model: "stub" });
const callTools = (calls, text) => (req, cb) => cb(null, { text: text || "", toolCalls: calls, provider: "stub", model: "stub" });

function runCollect(opts) {
  chatLog = [];
  const ev = { proposals: [], receipts: [], texts: [], errors: [], warnings: [], done: null, confirmation: null };
  return new Promise(resolve => {
    ORCH.send(opts, {
      onProposal: p => ev.proposals.push(p),
      onReceipt: p => ev.receipts.push(p),
      onText: p => ev.texts.push(p.text),
      onStatus: p => { if (p.state === "persist_warning") ev.warnings.push(p.message); },
      onError: p => ev.errors.push(p.message),
      onConfirmationNeeded: p => { ev.confirmation = p; resolve(ev); },
      onDone: p => { ev.done = p; resolve(ev); }
    });
  });
}
function runToolCollect(name, args) {
  const ev = { proposals: [], receipts: [], errors: [], done: null, confirmation: null };
  return new Promise(resolve => {
    const id = ORCH.runTool(name, args || {}, {
      onProposal: p => ev.proposals.push(p),
      onReceipt: p => ev.receipts.push(p),
      onError: p => ev.errors.push(p.message),
      onConfirmationNeeded: p => { ev.confirmation = p; resolve(ev); },
      onDone: p => { ev.done = p; resolve(ev); }
    });
    if (id === null) resolve(ev);
  });
}
function untilIdle() { return new Promise(r => { const iv = setInterval(() => { if (!ORCH.isBusy()) { clearInterval(iv); r(); } }, 10); }); }

/* local routing for the whole suite (the reported defect is the local model) */
KOS.ai.setRouting("complex", "ollama", "qwen3:4b-instruct");
KOS.ai.setRouting("crud", "ollama", "qwen3:4b-instruct");
KOS.ai.setRouting("generation", "ollama", "qwen3:4b-instruct");

/* a real leaf with notes to ground generation against */
const SID = "compsci";
let REF = null;
function freshCards() { return KOS.hub.LEAVES[SID].find(l => KOS.content.has(SID, l.ref) && (KOS.content.get(SID, l.ref).notes || []).length).ref; }

/* ============ 1 · prose-only "generation" is not a proposal ============ */
console.log("== prose-only generation ==");

step("model writing flashcards as PROSE (no tool call) is NOT a proposal and saves nothing", async () => {
  assert(errors.length === 0, "load errors: " + errors.join(" | "));
  REF = freshCards();
  KOS.ai.tools.clearPendingArtifact();
  const before = KOS.store.state.custom.cards.length;
  chatScript = [say("Here are some flashcards:\n1. Q: What is X? A: Y")];   // prose, no tool
  const ev = await runCollect({ userText: "give me one flashcard", category: "complex", conversationKey: "c-prose" });
  await untilIdle();
  assert(ev.proposals.length === 0, "prose must not emit a proposal event");
  assert(!KOS.ai.tools.getPendingArtifact(), "prose must not create a pending artifact");
  assert(KOS.store.state.custom.cards.length === before, "prose must not save any card");
  assert(ev.receipts.length === 0, "prose (no write) must not produce a receipt");
});

/* ============ 2 + 6 · false success is corrected ============ */
console.log("== false success correction ==");

step("a success CLAIM with no write is corrected (one nudge, then deterministic correction)", async () => {
  KOS.ai.tools.clearPendingArtifact();
  chatScript = [say("This has been saved to your deck."), say("It is definitely saved now.")];
  const ev = await runCollect({ userText: "save that", category: "complex", conversationKey: "c-false" });
  await untilIdle();
  assert(ev.done && ev.done.status === "complete", "the turn still completes");
  assert(ev.receipts.length === 0, "nothing wrote, so there must be NO receipt");
  const finalText = ev.texts[ev.texts.length - 1] || "";
  assert(/Correction/i.test(finalText) && /nothing was actually saved/i.test(finalText),
    "a false 'saved' claim must be corrected deterministically, got: " + finalText);
  assert(chatLog.length === 2, "the model must get exactly one corrective retry, saw " + chatLog.length + " turns");
});

step("a FAILED save tool cannot be described as saved", async () => {
  KOS.ai.tools.clearPendingArtifact();   // nothing pending → study_save_proposed fails
  chatScript = [
    callTools([{ id: "s1", name: "study_save_proposed", args: {} }], "Saving now."),
    say("Done — I've saved them to your deck."),   // false claim → nudge
    say("Yes, they are saved.")                     // still false after nudge → correction
  ];
  const ev = await runCollect({ userText: "add them", category: "complex", conversationKey: "c-failsave" });
  await untilIdle();
  assert(ev.receipts.length === 0, "a failed save must produce NO receipt");
  const finalText = ev.texts[ev.texts.length - 1] || "";
  assert(/Correction/i.test(finalText), "claiming a failed save succeeded must be corrected, got: " + finalText);
  assert(KOS.store.state.custom.cards.length >= 0, "sanity");
});

/* ============ 3 + 5 + 9 · proposal ≠ persisted; receipt on real write ============ */
console.log("== proposal vs persisted, verified receipts ==");

let PROPOSE_TOPIC = null;
step("study_propose_flashcards holds a validated UNSAVED artifact, emits a proposal, saves nothing", async () => {
  REF = freshCards();
  KOS.ai.tools.clearPendingArtifact();
  const before = KOS.store.state.custom.cards.length;
  genScript = [{ cards: [{ q: "PA-Q1?", a: "PA-A1" }, { q: "PA-Q2?", a: "PA-A2" }] }];
  chatScript = [callTools([{ id: "p1", name: "study_propose_flashcards", args: { subject: SID, ref: REF, count: 2 } }], "I've drafted two for review."), say("Ready when you are.")];
  const ev = await runCollect({ userText: "draft me two flashcards to review", category: "complex", conversationKey: "c-prop" });
  await untilIdle();
  assert(ev.proposals.length === 1 && ev.proposals[0].kind === "flashcards" && ev.proposals[0].count === 2,
    "a proposal event with the validated count must fire");
  assert(ev.receipts.length === 0, "a proposal is a READ — it must NOT produce a write receipt");
  const art = KOS.ai.tools.getPendingArtifact();
  assert(art && art.items.length === 2, "the validated artifact must be HELD");
  assert(KOS.store.state.custom.cards.length === before, "a proposal must persist NOTHING");
  PROPOSE_TOPIC = art.topicTitle;
});

step("the Save action runs the EXACT pending artifact, emits a VERIFIED receipt, and persists the record", async () => {
  const before = KOS.store.state.custom.cards.length;
  const ev = await runToolCollect("study_save_proposed", {});
  await untilIdle();
  assert(!ev.confirmation, "a reversible save must not require confirmation by default");
  assert(ev.receipts.length === 1, "a successful write must produce exactly one receipt");
  const rc = ev.receipts[0];
  assert(rc.tool === "study_save_proposed", "the receipt carries the REAL tool, got " + rc.tool);
  assert(/saved 2 flashcard/i.test(rc.summary), "the receipt summary reflects the real result, got: " + rc.summary);
  assert(rc.result && rc.result.saved === 2 && rc.result.topic === PROPOSE_TOPIC,
    "the receipt result is the real persisted record (count + topic)");
  assert(KOS.store.state.custom.cards.length === before + 2, "the cards must ACTUALLY be persisted");
  assert(KOS.store.state.custom.cards.slice(-2).every(c => c.ai === true), "saved cards are AI-marked");
  assert(!KOS.ai.tools.getPendingArtifact(), "the artifact is cleared after saving");
  // retrieval proof: the persisted cards are readable back
  const inDeck = KOS.srs.cardsFor(SID, REF).filter(c => /^PA-Q/.test(c.q));
  assert(inDeck.length === 2, "the saved cards must be retrievable from the real deck");
});

step("a read tool alone produces NO receipt (receipts are write-only proof)", async () => {
  chatScript = [callTools([{ id: "r1", name: "study_subjects", args: {} }], "Here's your overview."), say("That's your progress.")];
  const ev = await runCollect({ userText: "how are my subjects", category: "complex", conversationKey: "c-read" });
  await untilIdle();
  assert(ev.receipts.length === 0, "a pure read turn must produce no receipts");
});

/* ============ 4 · Save executes the EXACT (edited) artifact ============ */
console.log("== exact-artifact save (with edits) ==");

step("editing a proposal then saving persists the EDITED items verbatim", async () => {
  REF = freshCards();
  KOS.ai.tools.clearPendingArtifact();
  genScript = [{ cards: [{ q: "orig-q1?", a: "orig-a1" }, { q: "orig-q2?", a: "orig-a2" }] }];
  await new Promise(res => KOS.ai.tools.execute("study_propose_flashcards", { subject: SID, ref: REF, count: 2 }, () => res()));
  // the UI Edit action writes back through updatePendingArtifact
  const edited = [{ q: "EDITED-q1?", a: "EDITED-a1" }, { q: "EDITED-q2?", a: "EDITED-a2" }];
  assert(KOS.ai.tools.updatePendingArtifact(edited), "updatePendingArtifact must accept valid items");
  const before = KOS.store.state.custom.cards.length;
  const ev = await runToolCollect("study_save_proposed", {});
  await untilIdle();
  assert(ev.receipts.length === 1 && ev.receipts[0].result.saved === 2, "the edited set saves");
  const saved = KOS.store.state.custom.cards.slice(-2);
  assert(saved.some(c => c.q === "EDITED-q1?") && saved.some(c => c.q === "EDITED-q2?"),
    "the EDITED items must be persisted, not the originals: " + JSON.stringify(saved.map(c => c.q)));
  assert(!saved.some(c => /^orig-/.test(c.q)), "the original (superseded) items must NOT be saved");
  assert(KOS.store.state.custom.cards.length === before + 2, "exactly the edited batch persisted");
});

/* ============ 7 · batch generation cannot finish after only reading ============ */
console.log("== promise-after-read is not completion ==");

step("reading notes then PROMISING to generate (no proposal/write) is not accepted as done", async () => {
  KOS.ai.tools.clearPendingArtifact();
  chatScript = [
    callTools([{ id: "n1", name: "study_read_notes", args: { subject: SID, ref: REF } }], ""),   // only reads
    say("I'll now generate 8 flashcards from these notes."),   // promise, no action
    say("I'll generate them shortly.")                          // still no action after the nudge
  ];
  const ev = await runCollect({ userText: "Generate 8 flashcards from my real notes", category: "complex", conversationKey: "c-batch" });
  await untilIdle();
  assert(ev.proposals.length === 0 && ev.receipts.length === 0, "no proposal/write actually happened");
  const finalText = ev.texts[ev.texts.length - 1] || "";
  assert(/did not actually perform|Correction|Note:/i.test(finalText),
    "an unfulfilled 'I'll generate…' must not be accepted as the final answer, got: " + finalText);
  assert(chatLog.length >= 2, "the model must get a corrective retry before the correction");
});

step("a promise that IS fulfilled by a proposal is accepted (no false correction)", async () => {
  REF = freshCards();
  KOS.ai.tools.clearPendingArtifact();
  genScript = [{ cards: [{ q: "F-q1?", a: "F-a1" }, { q: "F-q2?", a: "F-a2" }, { q: "F-q3?", a: "F-a3" }] }];
  chatScript = [callTools([{ id: "g1", name: "study_propose_flashcards", args: { subject: SID, ref: REF, count: 3 } }], "Let me generate three for review."), say("Drafted three — review and save when ready.")];
  const ev = await runCollect({ userText: "make three flashcards", category: "complex", conversationKey: "c-fulfil" });
  await untilIdle();
  assert(ev.proposals.length === 1, "the proposal fired");
  const finalText = ev.texts[ev.texts.length - 1] || "";
  assert(!/Correction|did not actually perform/i.test(finalText), "a fulfilled proposal must NOT be corrected: " + finalText);
  KOS.ai.tools.clearPendingArtifact();
});

/* ============ 8 · atomic batch: 8 or clean failure, never partial ============ */
console.log("== batch atomicity ==");

step("8 requested + 8 valid unique cards → exactly 8 validated proposals", async () => {
  REF = freshCards();
  KOS.ai.tools.clearPendingArtifact();
  const eight = Array.from({ length: 8 }, (_, i) => ({ q: "8q" + i + "?", a: "8a" + i }));
  genScript = [{ cards: eight }];
  const r = await new Promise(res => KOS.ai.tools.execute("study_propose_flashcards", { subject: SID, ref: REF, count: 8 }, (e, out) => res({ e, out })));
  assert(!r.e && r.out.proposed === 8, "eight valid cards must propose exactly eight, got " + (r.e ? r.e.message : r.out.proposed));
  assert(KOS.ai.tools.getPendingArtifact().items.length === 8, "all eight are held as the artifact");
  KOS.ai.tools.clearPendingArtifact();
});

step("a malformed batch fails cleanly — nothing held, nothing saved (no partial silent save)", async () => {
  REF = freshCards();
  KOS.ai.tools.clearPendingArtifact();
  const before = KOS.store.state.custom.cards.length;
  genScript = [{ cards: [{ q: "ok?", a: "yes" }, { q: "bad", a: "" }, { q: "x?", extra: 1 }] }];   // invalid members
  const r = await new Promise(res => KOS.ai.tools.execute("study_propose_flashcards", { subject: SID, ref: REF, count: 8 }, (e, out) => res({ e, out })));
  assert(r.e, "a malformed batch must fail, not partially propose");
  assert(!KOS.ai.tools.getPendingArtifact(), "a failed batch holds NOTHING");
  assert(KOS.store.state.custom.cards.length === before, "a failed batch saves NOTHING");
});

/* ============ 10 · cloud + Phase C unchanged ============ */
console.log("== gemini/deepseek + confirmation unchanged ==");

step("Gemini routing still sends the full tool list and no num_ctx (unchanged)", async () => {
  KOS.ai.setRouting("complex", "gemini", "gemini-3.5-flash");
  chatScript = [say("hi from gemini")];
  await runCollect({ userText: "hello", category: "complex", conversationKey: "c-gem" });
  await untilIdle();
  assert(chatLog[0].numCtx === undefined, "gemini must not receive num_ctx");
  assert(chatLog[0].tools.length > 20, "gemini must get the full tool list, got " + chatLog[0].tools.length);
  KOS.ai.setRouting("complex", "ollama", "qwen3:4b-instruct");
});

step("the DeepSeek adapter is intact (not deleted while deferred)", async () => {
  assert(typeof KOS.ai.chatWith === "function", "chatWith exists");
  const provs = KOS.ai.providers ? KOS.ai.providers() : null;
  // presence check via routing acceptance — setting deepseek must not throw
  let ok = true;
  try { KOS.ai.setRouting("crud", "deepseek", "deepseek-v4-flash"); } catch (e) { ok = false; }
  KOS.ai.setRouting("crud", "ollama", "qwen3:4b-instruct");
  assert(ok, "the deepseek provider must remain a valid route target");
});

step("a consequential tool STILL pauses for explicit confirmation (Phase C unchanged)", async () => {
  await untilIdle();
  KOS.ai.tools.clearPendingArtifact();
  // a real, existing target so we reach the confirmation gate (not arg/target validation)
  KOS.todo.addManual("smoke28 delete-me task");
  const task = KOS.store.state.todo.manual[KOS.store.state.todo.manual.length - 1];
  const ev = await runToolCollect("todo_delete_task", { id: task.id });
  assert(ev.confirmation && ev.confirmation.tool === "todo_delete_task",
    "a consequential tool must pause for confirmation, not auto-run");
  // it must NOT have executed yet — the task still exists
  assert(KOS.store.state.todo.manual.some(t => t.id === task.id), "nothing runs before confirmation");
  ORCH.reject(ev.confirmation.confirmationId || ev.confirmation.id, () => {});
  await untilIdle();
  assert(KOS.store.state.todo.manual.some(t => t.id === task.id), "a declined action never runs");
  KOS.todo.deleteManual(task.id);   // cleanup
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
  if (failed) { console.error("SMOKE28 FAILED — " + failed + " step(s)"); process.exit(1); }
  console.log("SMOKE28 PASS — execution grounding verified (" + steps.length + " steps).");
  process.exit(0);
})();
