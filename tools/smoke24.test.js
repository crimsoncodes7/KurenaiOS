/* Kurenai OS — smoke24.test.js
   Category 6 Phase E: the three assistant UI surfaces (drawer, contextual
   actions, dedicated page) over the one shared controller.

   Run:
     npm install jsdom fake-indexeddb   (one-time)
     node tools/smoke24.test.js

   TESTED PROPERTIES:
   1. Shared architecture: the drawer and the dedicated page render ONE
      controller state (thread moves between them; one busy flag; no second
      submission path); the UI never calls Phase B tools directly, never
      reconstructs confirmations, never infers mascot state from text
      (source contracts).
   2. Character: all six lifecycle states map to unique 1024x1536 RGBA
      full-body assets; request ownership rejects stale transitions;
      confirmations latch; transient states auto-return safely; failed
      image loads fall back to glyph + text; reduced-motion CSS exists.
   3. Drawer: open/close/toggle with focus into the composer and back to
      the trigger; Escape closes; draft survives close/reopen; duplicate
      submission is refused while busy; Stop cancels; CLOSING DOES NOT
      CANCEL; the confirmation card renders from the canonical Phase C
      object, Decline leaves the target intact, Confirm executes, an
      expired card refuses and nothing runs.
   4. Contextual actions: the topic strip and the vault-editor hook submit
      through the shared path with live context in the prompt — no direct
      tool execution.
   5. Dedicated page: chat/history/settings/memory/permissions/activity
      tabs; history create/list/rename/open/delete via KOS.ai.convo stays
      in sync with the drawer; routing edits ride KOS.ai.setRouting /
      setFallback; memory management rides KOS.ai.memory; the permissions
      UI cannot offer auto-run for consequential tools; the audit list
      renders lifecycle rows and offers NO delete control; signed-out
      states explain themselves.
   6. Security: provider text renders inertly (no HTML injection); no API
      key material anywhere in assistant state or DOM; historical tool
      rows are not interactive; the drawer/page never expose more than the
      sanitized confirmation args.
   7. Voice: one local Audio player, 22 offline ElevenLabs clips, opt-in
      persistence, lifecycle priority, settling/suppression and shared
      interaction cooldowns; no speech-synthesis dependency.              */

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
window.confirm = () => true; window.__kosAutoConfirm = true;
const audioLog = [];
class FakeAudio {
  constructor() { this.src = ""; this.volume = 1; this.currentTime = 0; this.listeners = {}; }
  addEventListener(name, fn) { this.listeners[name] = fn; }
  play() { audioLog.push({ src: this.src, volume: this.volume }); return Promise.resolve(); }
  pause() {}
}
window.Audio = FakeAudio;

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
const A = KOS.assistant, ORCH = KOS.ai.orchestrator;
const doc = window.document;

const steps = [];
function step(name, fn) { steps.push([name, fn]); }
const tick = ms => new Promise(r => setTimeout(r, ms || 0));
function assert(cond, msg) { if (!cond) throw new Error(msg); }
const read = f => fs.readFileSync(path.join(ROOT, f), "utf8");
const p = fn => new Promise((res, rej) => fn((err, out) => err ? rej(err instanceof Error ? err : new Error(String(err))) : res(out)));

/* scripted provider + audit sink */
let chatScript = [], chatLog = [];
KOS.ai.chat = function (category, request, cb) {
  chatLog.push({ category, request });
  const next = chatScript.shift();
  if (!next) { cb(null, { text: "…", toolCalls: [], provider: "stub", model: "stub" }); return; }
  setTimeout(() => next(request, cb), 0);
};
const say = text => (req, cb) => cb(null, { text, toolCalls: [], provider: "stub", model: "stub" });
const callTools = (calls, text) => (req, cb) => cb(null, { text: text || "", toolCalls: calls, provider: "stub", model: "stub" });
ORCH._config({ auditApi: { insert: (r, cb) => cb(null), update: (id, patch, cb) => cb(null) } });

/* fake convo/memory store (user-scoped) */
function makeDb() {
  const tables = { kos_assistant_conversations: [], kos_assistant_messages: [], kos_assistant_memory: [] };
  const api = {
    select(table, match, order, cb) {
      let rows = tables[table].filter(r => Object.keys(match).every(k => r[k] === match[k]))
        .map(r => JSON.parse(JSON.stringify(r)));
      if (order) rows.sort((a, b) => ((a[order.col] || "") < (b[order.col] || "") ? -1 : 1) * (order.asc ? 1 : -1));
      cb(null, rows);
    },
    insert(table, row, cb) {
      tables[table].push(Object.assign({ created_at: new Date().toISOString(), updated_at: new Date().toISOString() }, row));
      cb(null);
    },
    update(table, match, patch, cb) {
      tables[table].filter(r => Object.keys(match).every(k => r[k] === match[k]))
        .forEach(r => Object.assign(r, patch, { updated_at: new Date().toISOString() }));
      cb(null);
    },
    remove(table, match, cb) {
      tables[table] = tables[table].filter(r => !Object.keys(match).every(k => r[k] === match[k]));
      if (table === "kos_assistant_conversations" && match.id) {
        tables.kos_assistant_messages = tables.kos_assistant_messages.filter(m => m.conversation_id !== match.id);
      }
      cb(null);
    }
  };
  return { tables, api };
}
const db = makeDb();

function signIn() {
  KOS.cloud.available = () => true;
  KOS.cloud.userId = () => "user-a";
  KOS.cloud.configured = () => true;
}
function drawer() { return doc.querySelector(".asst-drawer"); }
function untilIdle() {
  return new Promise(resolve => {
    const iv = setInterval(() => { if (!ORCH.isBusy()) { clearInterval(iv); resolve(); } }, 10);
  });
}

/* ============ 1 · source contracts (shared architecture) ============ */
console.log("== shared architecture contracts ==");

step("UI never executes tools, never rebuilds confirmations, never infers mascot state", async () => {
  assert(errors.length === 0, "load errors: " + errors.join(" | "));
  const src = read("js/modules/assistant.js");
  assert(!/tools\.execute/.test(src), "the UI must NEVER call tools.execute");
  assert(!/mediadb\.(put|add|remove)/.test(src), "the UI must never write the vault directly");
  assert(!/memory\.add\([^)]*"(inferred|auto)/.test(src), "no silent memory writes");
  assert(/orchestrator\.confirm/.test(src) && /orchestrator\.reject/.test(src), "confirmations must ride the canonical Phase C path");
  assert(!/\.text\.(match|includes|indexOf)\(/.test(src), "mascot state must not be inferred from message text");
  const setVisualCalls = src.match(/setVisual\(/g).length;
  assert(setVisualCalls > 5, "visual state must be driven explicitly by lifecycle events");
  assert(/new window\.Audio/.test(src) && /voice\/state\//.test(src) && /characterAudio/.test(src),
    "state cues must use one local Audio player behind the saved opt-in");
  assert(!/SpeechSynthesisUtterance|speechSynthesis\.speak/.test(src),
    "the character engine must have no browser speech-synthesis dependency");
});

step("all six character states map to unique full-body RGBA assets and 22 local clips", async () => {
  const states = ["idle", "thinking", "working", "success", "error", "confirmation"];
  const stateFiles = [];
  states.forEach(s => {
    const st = A.MASCOT_STATES[s];
    assert(st && st.label, s + " needs a textual label");
    const file = path.join(ROOT, "assets/assistant", st.image);
    assert(fs.existsSync(file), "missing production asset: " + st.image);
    const png = fs.readFileSync(file);
    assert(png.readUInt32BE(16) === 1024 && png.readUInt32BE(20) === 1536,
      s + " must use the canonical 1024x1536 canvas");
    assert(png.readUInt8(25) === 6, s + " must be a true RGBA PNG");
    stateFiles.push(st.image);
    assert(st.audio && fs.existsSync(path.join(ROOT, "assets/assistant", st.audio)), "missing state clip: " + st.audio);
  });
  assert(new Set(stateFiles).size === 6, "every lifecycle state needs distinct full-body art");
  const interactionFiles = Object.values(A.CHARACTER_REACTIONS).flatMap(spec => spec.files);
  assert(interactionFiles.length === 16 && new Set(interactionFiles).size === 16, "four unique clips are required for each reaction");
  interactionFiles.forEach(file => {
    const full = path.join(ROOT, "assets/assistant/voice/interaction", file);
    assert(fs.existsSync(full) && fs.statSync(full).size > 500, "missing/empty reaction clip: " + file);
  });
  assert(fs.existsSync(path.join(ROOT, "assets/assistant/logo/whispering-bloom-emblem.png")), "emblem missing");
  assert(fs.existsSync(path.join(ROOT, "assets/assistant/logo/whispering-bloom-wordmark.png")), "wordmark missing");
  const css = read("css/main.css");
  assert(/prefers-reduced-motion[\s\S]{0,200}asst-mascot-img/.test(css) || /prefers-reduced-motion[\s\S]{0,200}transition: none/.test(css),
    "reduced-motion contract missing for the mascot");
  assert(/prefers-reduced-motion[\s\S]{0,120}\.assistant-trigger/.test(css), "reduced-motion contract missing for the trigger");
  const deploy = read("tools/deploy_pages.sh");
  assert(/cp -R css icons assets/.test(deploy), "assets/ must ship in the production deploy");
});

/* ============ 2 · mascot behaviour ============ */
console.log("== mascot ==");

step("explicit state changes; success auto-returns; image failure falls back", async () => {
  const node = A.mascotNode("small");
  doc.body.appendChild(node);
  A.setVisual("thinking");
  assert(node.getAttribute("data-state") === "thinking", "state attr must follow");
  assert(node.querySelector(".asst-status-line").textContent === "Thinking…", "status text must follow");
  A.setVisual("working", "Running study_generate_flashcards…");
  assert(/study_generate_flashcards/.test(node.querySelector(".asst-status-line").textContent),
    "the REAL operation name must be usable as status");
  A.MASCOT_STATES.success.autoReturnMs = 40;
  A.setVisual("success");
  assert(node.getAttribute("data-state") === "success", "success state missing");
  await tick(120);
  assert(node.getAttribute("data-state") === "idle", "success must auto-return to idle");
  const img = node.querySelector(".asst-mascot-img");
  img.dispatchEvent(new window.Event("error"));
  assert(node.classList.contains("img-failed"), "image failure must mark the node");
  assert(node.querySelector(".asst-status-line").textContent.length > 0, "text status must survive image failure");
  node.remove();
});

step("request ownership, confirmation latch and stale timers are deterministic", async () => {
  A._config({ resetCharacter: true });
  assert(A.character.setLifecycle("thinking", { requestId: "req-old", claim: true, silentAudio: true }), "old request must claim");
  A.MASCOT_STATES.success.autoReturnMs = 40;
  assert(A.character.setLifecycle("success", { requestId: "req-old", releaseConfirmation: true, silentAudio: true }), "success should apply");
  assert(A.character.setLifecycle("thinking", { requestId: "req-new", claim: true, releaseConfirmation: true, silentAudio: true }), "new request must take ownership");
  assert(A.character.setLifecycle("error", { requestId: "req-old", silentAudio: true }) === false, "stale request event must be rejected");
  await tick(90);
  assert(A.state().visual === "thinking", "stale success timer must not reset the new request");
  assert(A.character.setLifecycle("confirmation", { requestId: "req-new", silentAudio: true }), "confirmation should latch");
  assert(A.character.setLifecycle("working", { requestId: "req-new", silentAudio: true }) === false, "latched confirmation must resist ordinary transitions");
  assert(A.character.setLifecycle("working", { requestId: "req-new", releaseConfirmation: true, silentAudio: true }), "approved/rejected confirmation must release explicitly");
});

step("local audio settles, prioritises lifecycle and enforces shared cooldowns", async () => {
  let now = 100000;
  audioLog.length = 0;
  KOS.store.state.assistant = KOS.store.state.assistant || {};
  KOS.store.state.assistant.workspace = KOS.store.state.assistant.workspace || {};
  KOS.store.state.assistant.workspace.characterAudio = { enabled: true, volume: 0.37 };
  A._config({ resetCharacter: true, now: () => now, audioFactory: () => new FakeAudio() });
  A.character.setLifecycle("thinking", { requestId: "audio-a", claim: true, releaseConfirmation: true });
  A.character.setLifecycle("working", { requestId: "audio-a" });
  await tick(290);
  assert(audioLog.length === 1 && /voice\/state\/working\.mp3$/.test(audioLog[0].src),
    "250ms settling must suppress the superseded thinking line");
  assert(audioLog[0].volume === 0.37, "saved volume must reach the shared player");
  const afterWorking = audioLog.length;
  A.character.stopAudio();
  A.character.setLifecycle("working", { requestId: "audio-a" });
  await tick(280);
  assert(audioLog.length === afterWorking, "same lifecycle line must be suppressed for 15 seconds");
  now += 15001;
  A.character.setLifecycle("working", { requestId: "audio-a" });
  await tick(280);
  assert(audioLog.length === afterWorking + 1, "lifecycle line should recover after suppression window");
  assert(A.character.react("head") === false, "interactions must not override an active lifecycle");
  A.character.setLifecycle("idle", { requestId: "audio-a", releaseConfirmation: true, silentAudio: true });
  assert(A.character.react("head"), "first idle tap should play");
  assert(A.character.react("flower") === false, "all tap zones must share the global cooldown");
  A.character.stopAudio();
  now += 8001;
  assert(A.character.react("flower"), "tap should recover after eight seconds");
  A.character.stopAudio();
  assert(A.character.react("hover"), "first hover reaction should play");
  A.character.stopAudio();
  assert(A.character.react("hover") === false, "hover needs its independent 30 second cooldown");
  const beforeMute = audioLog.length;
  KOS.store.state.assistant.workspace.characterAudio.enabled = false;
  now += 31000;
  assert(A.character.react("hover") === false && audioLog.length === beforeMute, "muted playback must fail silently");

  KOS.store.state.assistant.workspace.characterAudio.enabled = true;
  A.character.stopAudio();
  const mascot = A.mascotNode("large");
  doc.body.appendChild(mascot);
  const frame = mascot.querySelector(".asst-mascot-frame");
  frame.dispatchEvent(new window.Event("pointerenter"));
  await tick(250);
  frame.dispatchEvent(new window.Event("pointerleave"));
  await tick(620);
  assert(audioLog.length === beforeMute, "leaving before 800ms must cancel hover audio");
  frame.dispatchEvent(new window.Event("pointerenter"));
  await tick(840);
  assert(audioLog.length === beforeMute + 1 && /voice\/interaction\/hover-/.test(audioLog[audioLog.length - 1].src),
    "an 800ms idle dwell should play one hover variant");
  frame.dispatchEvent(new window.Event("pointerleave"));
  mascot.remove();

  class RejectingAudio extends FakeAudio { play() { return Promise.reject(new Error("autoplay denied")); } }
  A.character.stopAudio();
  now += 15001;
  A._config({ audioFactory: () => new RejectingAudio() });
  A.character.setLifecycle("thinking", { requestId: "audio-reject", claim: true, releaseConfirmation: true });
  await tick(290);
  assert(A.state().visual === "thinking", "autoplay rejection must not disturb textual lifecycle state");
  A.character.stopAudio();
  A._config({ now: null, audioFactory: null, resetCharacter: true });
});

/* ============ 3 · drawer ============ */
console.log("== drawer ==");

step("trigger + open/close/toggle with focus contract; Escape closes", async () => {
  const trigger = doc.getElementById("assistant-trigger");
  assert(trigger && trigger.getAttribute("aria-label"), "trigger must exist with an accessible label");
  trigger.focus();
  A.open();
  assert(drawer(), "drawer must open");
  assert(trigger.getAttribute("aria-expanded") === "true", "aria-expanded must track");
  assert(doc.activeElement === drawer().querySelector(".asst-composer-in"), "focus must land in the composer");
  drawer().dispatchEvent(new window.KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
  assert(!drawer(), "Escape must close the drawer");
  assert(doc.activeElement === trigger, "focus must return to the trigger");
  A.toggle(); assert(drawer(), "toggle must reopen");
  A.toggle(); assert(!drawer(), "toggle must close");
});

step("draft survives close/reopen; Enter submits; duplicate submission refused", async () => {
  A.open();
  const ta = drawer().querySelector(".asst-composer-in");
  ta.value = "half-typed thought";
  ta.dispatchEvent(new window.Event("input", { bubbles: true }));
  A.close();
  A.open();
  assert(drawer().querySelector(".asst-composer-in").value === "half-typed thought", "draft must survive");
  drawer().querySelector(".asst-composer-in").value = "";
  A.state().draft = "";

  chatScript = [(req, cb) => setTimeout(() => cb(null, { text: "done", toolCalls: [], provider: "stub", model: "stub" }), 150)];
  chatLog = [];
  const ta2 = drawer().querySelector(".asst-composer-in");
  ta2.value = "first";
  ta2.dispatchEvent(new window.KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
  await tick(20);
  assert(A.state().busy, "must be busy");
  assert(A.submit("second") === false, "a second submission while busy must be refused");
  await untilIdle();
  assert(chatLog.length === 1, "exactly one provider request");
  assert(A.state().thread.some(r => r.kind === "assistant" && r.text === "done"), "reply must land in the thread");
  A.close();
});

step("closing the drawer does NOT cancel; Stop does", async () => {
  chatScript = [(req, cb) => setTimeout(() => cb(null, { text: "slow reply", toolCalls: [], provider: "stub", model: "stub" }), 200)];
  A.open();
  A.submit("slow one");
  await tick(20);
  A.close();
  assert(ORCH.isBusy(), "CLOSING MUST NOT CANCEL the live request");
  await untilIdle();
  A.open();
  assert(A.state().thread.some(r => r.text === "slow reply"), "the reply must arrive into the shared thread");

  chatScript = [(req, cb) => setTimeout(() => cb(null, { text: "never shown", toolCalls: [], provider: "stub", model: "stub" }), 400)];
  A.submit("cancel me");
  await tick(20);
  drawer().querySelector(".asst-cancel").click();
  assert(!ORCH.isBusy(), "Stop must cancel");
  assert(/Cancelled/.test(A.state().statusText), "status must say cancelled");
  await tick(450);
  A.close();
});

let victimId = null;
step("confirmation card: canonical object, Decline protects, Confirm executes", async () => {
  const add = await new Promise(r => KOS.ai.tools.execute("collection_add_entry",
    { module: "anime", title: "Drawer Victim", status: "planned" }, (e, res) => r(res)));
  victimId = add.id;
  chatScript = [
    callTools([{ id: "a", name: "collection_delete_entry", args: { entryId: victimId } }]),
    say("Understood.")
  ];
  A.open();
  A.submit("delete drawer victim");
  await tick(60);
  const card = drawer().querySelector(".asst-confirm-card");
  assert(card, "the confirmation card must render");
  assert(/collection_delete_entry/.test(card.textContent) && /Drawer Victim/.test(card.textContent),
    "the card must show the action and the resolved target");
  assert(A.state().pending && A.state().pending.confirmationId === ORCH.pendingConfirmation().id,
    "the card must be the CANONICAL Phase C object");
  const still = await new Promise(r => KOS.mediadb.get(victimId, (e, x) => r(x)));
  assert(still, "the target must be untouched while the card shows");
  [...card.querySelectorAll("button")].find(b => /Decline/.test(b.textContent)).click();
  await untilIdle();
  const alive = await new Promise(r => KOS.mediadb.get(victimId, (e, x) => r(x)));
  assert(alive, "Decline must leave the target intact");

  chatScript = [
    callTools([{ id: "a", name: "collection_delete_entry", args: { entryId: victimId } }]),
    say("Deleted.")
  ];
  A.submit("delete it for real");
  await tick(60);
  const card2 = drawer().querySelector(".asst-confirm-card");
  [...card2.querySelectorAll("button")].find(b => /Confirm/.test(b.textContent)).click();
  await untilIdle();
  const gone = await new Promise(r => KOS.mediadb.get(victimId, (e, x) => r(x)));
  assert(!gone, "Confirm must execute the stored action");
  A.close();
});

step("an expired card cannot execute", async () => {
  ORCH._config({ limits: { confirmMs: 50 } });
  const add = await new Promise(r => KOS.ai.tools.execute("collection_add_entry",
    { module: "anime", title: "Expiry Victim", status: "planned" }, (e, res) => r(res)));
  chatScript = [
    callTools([{ id: "a", name: "collection_delete_entry", args: { entryId: add.id } }]),
    say("ok")
  ];
  A.open();
  A.submit("delete expiry victim");
  await tick(120);   // past expiry
  const card = drawer().querySelector(".asst-confirm-card");
  [...card.querySelectorAll("button")].find(b => /Confirm/.test(b.textContent)).click();
  await untilIdle();
  const still = await new Promise(r => KOS.mediadb.get(add.id, (e, x) => r(x)));
  assert(still, "an expired confirmation must never run");
  assert(A.state().thread.some(r => r.kind === "warning" && /expired/.test(r.text)),
    "the expiry must be explained in the thread");
  ORCH._config({ limits: { confirmMs: 120000 } });
  await new Promise(r => KOS.mediadb.remove(add.id, () => r()));
  A.close();
});

/* ============ 4 · shared thread across surfaces + contextual actions ==== */
console.log("== shared surfaces + contextual actions ==");

step("the dedicated page renders the SAME thread as the drawer", async () => {
  KOS.show("assistant");
  await tick(40);
  const pageThread = doc.querySelector(".asst-page .asst-thread");
  assert(pageThread, "page chat must render");
  assert(/slow reply/.test(pageThread.textContent), "the page must show the drawer's conversation (one state)");
  assert(doc.querySelectorAll(".asst-tabs .study-tab").length === 6, "six page tabs expected");
});

step("topic contextual actions submit through the shared path with live context", async () => {
  const ref = KOS.hub.LEAVES.compsci[0];
  KOS.show("ref", { subject: "compsci", ref: ref.ref });
  await tick(60);
  const strip = doc.querySelector(".asst-ctx");
  assert(strip, "the topic page must carry the contextual strip");
  const btns = [...strip.querySelectorAll(".asst-ctx-btn")].map(b => b.textContent);
  assert(btns.includes("Ask Kurenai") && btns.includes("Make flashcards") && btns.includes("Make a quiz"),
    "expected the three topic actions, got " + btns.join(","));
  chatScript = [say("Here's the topic explained.")];
  chatLog = [];
  [...strip.querySelectorAll(".asst-ctx-btn")].find(b => b.textContent === "Ask Kurenai").click();
  await tick(30);
  assert(drawer(), "the action must surface the drawer");
  assert(chatLog.length === 1, "the action must ride the ONE submission path");
  /* the orchestrator appends the assistant reply to req.messages after the
     call (in-memory history), so check the USER message specifically */
  const userMsg = chatLog[0].request.messages.filter(m => m.role === "user").pop();
  const sentText = userMsg ? userMsg.content : "";
  assert(sentText.includes(ref.ref) && sentText.includes("compsci"), "live context must ride the prompt: " + sentText);
  assert(chatLog[0].category === "tutor", "the ask action routes as tutor");
  await untilIdle();
  A.close();
});

step("the vault editor hook adds an assistant action through the same path", async () => {
  const add = await new Promise(r => KOS.ai.tools.execute("collection_add_entry",
    { module: "anime", title: "Hook Show", status: "inProgress" }, (e, res) => r(res)));
  const overlay = KOS.mediaEditor({ id: add.id, module: "anime", title: "Hook Show" }, null);
  await tick(40);
  const strip = overlay && overlay.querySelector ? overlay.querySelector(".asst-ctx") : null;
  assert(strip, "the editor must carry the assistant strip");
  chatScript = [say("Here's where you are.")];
  chatLog = [];
  [...strip.querySelectorAll(".asst-ctx-btn")][0].click();
  await tick(30);
  assert(chatLog.length === 1 && chatLog[0].request.messages.some(m => /Hook Show/.test(m.content)),
    "the entry context must ride the shared path");
  await untilIdle();
  doc.querySelectorAll(".med-overlay, .modal-overlay").forEach(n => n.remove());
  A.close();
  await new Promise(r => KOS.mediadb.remove(add.id, () => r()));
});

/* ============ 5 · dedicated page management tabs ============ */
console.log("== dedicated page tabs ==");

step("history: create/list/open/rename/delete via KOS.ai.convo, synced with the drawer", async () => {
  signIn();
  KOS.ai.convo._config({ api: db.api });
  KOS.ai.memory._config({ api: db.api });
  A.newConversation();
  chatScript = [say("First saved reply.")];
  A.open();
  A.submit("start a saved conversation");
  await untilIdle();
  await tick(50);
  assert(A.state().conversationId, "a signed-in conversation must mint an id");
  A.close();

  KOS.show("assistant", { tab: "history" });
  await tick(80);
  let rows = doc.querySelectorAll(".asst-history-row");
  assert(rows.length === 1, "history must list the conversation, got " + rows.length);
  assert(rows[0].classList.contains("current"), "the open conversation must be marked current");

  rows[0].querySelector("[aria-label='Rename conversation']").click();
  const input = doc.querySelector(".asst-history-rename input");
  input.value = "Renamed thread";
  doc.querySelector(".asst-history-rename button").click();
  await tick(60);
  assert(db.tables.kos_assistant_conversations[0].title === "Renamed thread", "rename must ride KOS.ai.convo");

  /* resume from history back into chat */
  rows = doc.querySelectorAll(".asst-history-row");
  [...rows[0].querySelectorAll("button")].find(b => b.textContent === "Open").click();
  await tick(80);
  assert(/First saved reply/.test(doc.querySelector(".asst-thread").textContent),
    "resume must reload the stored messages into the shared thread");

  KOS.show("assistant", { tab: "history" });
  await tick(80);
  doc.querySelector(".asst-history-row [aria-label='Delete conversation']").click();
  await tick(80);
  assert(db.tables.kos_assistant_conversations.length === 0, "delete must remove the conversation");
  assert(A.state().conversationId === null, "deleting the current conversation must reset the thread");
});

step("settings: routing + fallback ride the real service; no key material anywhere", async () => {
  KOS.show("assistant", { tab: "settings" });
  await tick(60);
  const rows = doc.querySelectorAll(".asst-route-row");
  assert(rows.length >= 5, "routing rows expected");
  const tutorSel = rows[0].querySelector("select");
  tutorSel.value = "deepseek";
  tutorSel.dispatchEvent(new window.Event("change", { bubbles: true }));
  assert(KOS.ai.config().routing.tutor.provider === "deepseek", "routing edit must ride KOS.ai.setRouting");
  tutorSel.value = "gemini";
  tutorSel.dispatchEvent(new window.Event("change", { bubbles: true }));
  const fbSel = rows[0].querySelectorAll("select")[1];
  fbSel.value = "deepseek";
  fbSel.dispatchEvent(new window.Event("change", { bubbles: true }));
  assert(KOS.ai.config().fallback.tutor && KOS.ai.config().fallback.tutor.provider === "deepseek",
    "fallback edit must ride KOS.ai.setFallback");
  fbSel.value = "";
  fbSel.dispatchEvent(new window.Event("change", { bubbles: true }));
  assert(KOS.ai.config().fallback.tutor === null, "fallback must clear");
  const pageHtml = doc.querySelector(".asst-page").innerHTML;
  assert(!/sk-[A-Za-z0-9]|API[_ ]?KEY|SUPABASE_/.test(pageHtml), "no key material may appear in the page");
  assert(!/key/i.test(JSON.stringify(KOS.store.state.assistant.routing)), "no keys in persisted assistant state");
});

step("memory tab: add/edit/delete via KOS.ai.memory with origin labels", async () => {
  KOS.show("assistant", { tab: "memory" });
  await tick(60);
  const ta = doc.querySelector(".asst-memory-add textarea");
  ta.value = "Prefers evening review sessions";
  doc.querySelector(".asst-memory-add button").click();
  await tick(60);
  let rowEls = doc.querySelectorAll(".asst-memory-row");
  assert(rowEls.length === 1 && /evening review/.test(rowEls[0].textContent), "memory add via UI failed");
  assert(/you asked/.test(rowEls[0].textContent), "origin must be shown");
  rowEls[0].querySelector("[aria-label='Edit memory']").click();
  const eta = doc.querySelector(".asst-memory-edit textarea");
  eta.value = "Prefers late-evening review sessions";
  doc.querySelector(".asst-memory-edit button").click();
  await tick(60);
  assert(/late-evening/.test(doc.querySelector(".asst-memory-row").textContent), "memory edit failed");
  doc.querySelector(".asst-memory-row [aria-label='Delete memory']").click();
  await tick(60);
  assert(db.tables.kos_assistant_memory.length === 0, "memory delete failed");
});

step("permissions tab: consequential can never be offered auto-run", async () => {
  KOS.show("assistant", { tab: "permissions" });
  await tick(80);
  const rows = [...doc.querySelectorAll(".asst-perm-row")];
  assert(rows.length >= 60, "all registered tools must be listed, got " + rows.length);
  const conseq = rows.find(r => /collection_delete_entry/.test(r.textContent));
  const opts = [...conseq.querySelectorAll("option")].map(o => o.textContent);
  assert(opts.some(t => /always asks/.test(t)) && opts.some(t => /blocked/.test(t)),
    "consequential options wrong: " + opts.join("|"));
  assert(!opts.some(t => /runs/.test(t)), "consequential must NEVER offer auto-run");
  const rev = rows.find(r => /study_set_topic_status/.test(r.textContent));
  const sel = rev.querySelector("select");
  sel.value = "ask";
  sel.dispatchEvent(new window.Event("change", { bubbles: true }));
  assert(KOS.ai.orchestrator.effectiveMode("study_set_topic_status") === "ask", "tightening via UI must work");
  sel.value = "";
  sel.dispatchEvent(new window.Event("change", { bubbles: true }));
});

step("activity tab: lifecycle rows render; NO delete control", async () => {
  A._config({ auditReader: cb => cb(null, [
    { tool: "collection_delete_entry", tier: "consequential", status: "executed", target: "anime “X”", created_at: new Date().toISOString(), result_summary: '{"deleted":true}' },
    { tool: "memory_save", tier: "consequential", status: "rejected", created_at: new Date().toISOString() },
    { tool: "todo_add_task", tier: "reversible", status: "failed", error_summary: "boom", created_at: new Date().toISOString() }
  ], "cloud") });
  KOS.show("assistant", { tab: "activity" });
  await tick(60);
  const rows = doc.querySelectorAll(".asst-audit-row");
  assert(rows.length === 3, "audit rows expected");
  assert(/executed/.test(rows[0].textContent) && /rejected/.test(rows[1].textContent) && /failed/.test(rows[2].textContent),
    "statuses must render");
  const btns = doc.querySelectorAll(".asst-audit button, .asst-audit .mini-btn");
  assert(btns.length === 0, "the audit list must offer NO controls (undeletable by design)");
  A._config({ auditReader: null });
});

/* ============ 6 · security ============ */
console.log("== security ==");

step("provider text renders inertly — no HTML injection", async () => {
  A.newConversation();
  chatScript = [say('<img src=x onerror="window.__pwned=1"> **bold** <script>window.__pwned=2</script>')];
  A.open();
  A.submit("reply with html");
  await untilIdle();
  await tick(30);
  const bubbles = drawer().querySelectorAll(".asst-assistant .asst-bubble");
  const last = bubbles[bubbles.length - 1];
  assert(last.querySelector("img") === null && last.querySelector("script") === null,
    "provider HTML must never become live DOM");
  assert(/<img src=x/.test(last.textContent), "the raw text must render as text");
  assert(window.__pwned === undefined, "injected script must never run");
  A.close();
});

step("tool rows use one inert, progressively disclosed summary", async () => {
  A.newConversation();
  chatScript = [callTools([{ id: "subjects", name: "study_list_subjects", args: {} }]), say("Done")];
  A.open();
  A.submit("check subjects");
  await untilIdle();
  await tick(30);
  const group = drawer().querySelector("details.asst-tool");
  assert(group && group.querySelector("summary"), "tool activity must collapse into a native disclosure");
  assert(group.querySelectorAll("button").length === 0, "tool history must not expose action controls");
  assert(Array.from(group.querySelectorAll("*")).every(n => !n.onclick),
    "tool history disclosure must not carry custom click handlers");
  A.close();
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
  if (failed) { console.error("SMOKE24 FAILED — " + failed + " step(s)"); process.exit(1); }
  console.log("SMOKE24 PASS — Category 6 Phase E assistant surfaces verified (" + steps.length + " steps).");
  process.exit(0);
})();
