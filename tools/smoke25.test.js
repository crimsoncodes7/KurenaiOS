/* Kurenai OS — smoke25.test.js
   Category 6 Phase F regression: the Ollama model-configuration path, end to
   end. Locks the fix for "the Settings UI shows a model but a request says
   'No Ollama model is configured'" — a typed model that never blurred was
   discarded because the input only saved on `change`, so navigating away (or
   submitting) before blur lost it. The input now also saves on `input`.

   Run:
     npm install jsdom fake-indexeddb   (one-time)
     node tools/smoke25.test.js

   PROVES (the six properties requested):
   1. Editing an Ollama model in Settings PERSISTS it — on `input`, before any
      blur, and it reaches both KOS.ai.config() and localStorage (the UI is
      NOT merely rendering an unsaved input value).
   2. Reloading RESTORES it — a pre-seeded localStorage hydrates the routing.
   3. Every task-category route RESOLVES the configured model.
   4. Starting a request (the orchestrator's chat path) USES that model.
   5. The availability check and the request path read the SAME configuration
      source (cfg().ollama.url + route.model).
   6. An empty model gives the current "No Ollama model configured" error,
      while a configured model reaches /api/chat with that exact model. */

const { JSDOM } = require("jsdom");
const fs = require("fs");
const path = require("path");
const ROOT = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
const dom = new JSDOM(html, { url: "http://localhost:8471/index.html", runScripts: "outside-only", pretendToBeVisual: true });
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

/* --- PART 2 setup: PRE-SEED localStorage BEFORE the app loads, so the load
   path (deepMerge hydration) is exercised as a real reload would. --- */
const SEED = {
  progress: {},
  assistant: {
    routing: {
      tutor: { provider: "ollama", model: "qwen3:4b-instruct" },
      crud: { provider: "ollama", model: "qwen3:4b-instruct" },
      generation: { provider: "ollama", model: "qwen3:4b-instruct" },
      complex: { provider: "ollama", model: "qwen3:4b-instruct" }
    },
    fallback: { tutor: null, crud: null, generation: null, complex: null },
    ollama: { url: "http://127.0.0.1:11434" }
  }
};
window.localStorage.setItem("kurenai-os-v1", JSON.stringify(SEED));

const scripts = [...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map(m => m[1]);
for (const src of scripts) {
  try { window.eval(fs.readFileSync(path.join(ROOT, src), "utf8")); }
  catch (e) { errors.push(`LOAD FAIL ${src}: ${e.message}`); }
}
const KOS = window.KOS;
if (KOS.autosync) KOS.autosync.stop();
if (KOS.cloudsync) KOS.cloudsync.stop();
const doc = window.document;

const steps = [];
function step(name, fn) { steps.push([name, fn]); }
const tick = ms => new Promise(r => setTimeout(r, ms || 0));
function assert(cond, msg) { if (!cond) throw new Error(msg); }

/* ============ 2 · reload hydration (uses the pre-seeded localStorage) ==== */
console.log("== reload hydration ==");

step("a pre-seeded localStorage hydrates the routing on load (reload restores it)", async () => {
  assert(errors.length === 0, "load errors: " + errors.join(" | "));
  const r = KOS.ai.config().routing;
  ["tutor", "crud", "generation", "complex"].forEach(cat => {
    assert(r[cat].provider === "ollama" && r[cat].model === "qwen3:4b-instruct",
      cat + " did not hydrate from localStorage: " + JSON.stringify(r[cat]));
  });
  assert(KOS.ai.config().ollama.url === "http://127.0.0.1:11434", "ollama url did not hydrate");
});

/* ============ 1 · Settings input persists (not an unsaved value) ======== */
console.log("== settings input persistence ==");

step("editing the model input persists on `input` (before any blur) to config AND localStorage", async () => {
  // start from an EMPTY crud model to prove the edit is what persists it
  KOS.ai.setRouting("crud", "ollama", "");
  KOS.show("assistant", { tab: "settings" });
  await tick(60);
  const rows = [...doc.querySelectorAll(".asst-route-row")];
  const crudRow = rows.find(r => /Simple data requests/.test(r.textContent));
  assert(crudRow, "the crud settings row must render");
  const modelInput = crudRow.querySelector("input");
  assert(modelInput && modelInput.value === "", "the crud model input should start empty");
  // type the model and fire ONLY `input` (no blur / no change) — the fix
  modelInput.value = "qwen3:4b-instruct";
  modelInput.dispatchEvent(new window.Event("input", { bubbles: true }));
  await tick(20);
  // it must be persisted immediately, without a blur/change
  assert(KOS.ai.config().routing.crud.model === "qwen3:4b-instruct",
    "UNSAVED VALUE BUG: an input-typed model did not persist to config");
  const stored = JSON.parse(window.localStorage.getItem("kurenai-os-v1"));
  assert(stored.assistant.routing.crud.model === "qwen3:4b-instruct",
    "the typed model must persist to localStorage, not just the DOM");
});

step("navigating away without blurring does NOT lose the typed model", async () => {
  KOS.ai.setRouting("crud", "ollama", "");
  KOS.show("assistant", { tab: "settings" });
  await tick(60);
  const crudRow = [...doc.querySelectorAll(".asst-route-row")].find(r => /Simple data requests/.test(r.textContent));
  const modelInput = crudRow.querySelector("input");
  modelInput.value = "qwen3:4b-instruct";
  modelInput.dispatchEvent(new window.Event("input", { bubbles: true }));
  // simulate the user immediately switching tab (KOS.show destroys the input,
  // no `change` ever fires) — the reported symptom
  KOS.show("assistant", { tab: "history" });
  await tick(40);
  assert(KOS.ai.config().routing.crud.model === "qwen3:4b-instruct",
    "REGRESSION: the model was lost when the Settings tab was left before blur");
});

/* ============ 3 · every category resolves the configured model ========= */
console.log("== per-category resolution ==");

step("every task-category route resolves the configured Ollama model", async () => {
  ["tutor", "crud", "generation", "complex"].forEach(cat => {
    KOS.ai.setRouting(cat, "ollama", "qwen3:4b-instruct");
  });
  ["tutor", "crud", "generation", "complex"].forEach(cat => {
    const route = KOS.ai.config().routing[cat];
    assert(route.provider === "ollama" && route.model === "qwen3:4b-instruct",
      cat + " route does not resolve the configured model: " + JSON.stringify(route));
  });
});

/* ============ 5 + 6 · availability + request read the same source ======= */
console.log("== availability + request read the same config source ==");

step("the availability check and the request path both read cfg().ollama.url + the route model", async () => {
  const seen = { health: null, chat: null };
  KOS.ai.setOllamaUrl("http://127.0.0.1:11434");
  KOS.ai._config({ fetch: (url, opts) => {
    const u = String(url);
    if (/\/api\/tags$/.test(u)) { seen.health = u; return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve({ models: [{ name: "qwen3:4b-instruct" }] }) }); }
    if (/\/api\/chat$/.test(u)) { seen.chat = { url: u, model: JSON.parse(opts.body).model }; return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve({ message: { content: "ok" }, done_reason: "stop" }) }); }
    return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve({}) });
  } });
  // availability check
  const h = await new Promise(res => KOS.ai.health("ollama", (e, r) => res(r)));
  assert(h.available && h.url === "http://127.0.0.1:11434", "health must read cfg().ollama.url");
  // request path (crud → ollama qwen3)
  const r = await new Promise(res => KOS.ai.chat("crud", { messages: [{ role: "user", content: "hi" }] }, (e, resp) => res(e ? { err: e.message, kind: e.kind } : resp)));
  assert(seen.chat && seen.chat.url === "http://127.0.0.1:11434/api/chat", "the request must hit the SAME endpoint /api/chat");
  assert(seen.chat.model === "qwen3:4b-instruct", "CONFIGURED MODEL must reach /api/chat, got " + (seen.chat && seen.chat.model));
  assert(seen.health.startsWith("http://127.0.0.1:11434"), "health + request must share the endpoint source");
});

step("an EMPTY model gives the current 'No Ollama model is configured' error (no request made)", async () => {
  let chatCalled = false;
  KOS.ai._config({ fetch: (url) => { if (/\/api\/chat$/.test(String(url))) chatCalled = true; return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve({ message: { content: "" }, done_reason: "stop" }) }); } });
  KOS.ai.setRouting("crud", "ollama", "");
  const r = await new Promise(res => KOS.ai.chat("crud", { messages: [{ role: "user", content: "hi" }] }, (e) => res(e ? { err: e.message, kind: e.kind } : { ok: true })));
  assert(r.err && r.kind === "config" && /No Ollama model is configured/.test(r.err),
    "an empty model must give the config error, got " + JSON.stringify(r));
  assert(!chatCalled, "no /api/chat request may be made when the model is empty");
});

step("a CONFIGURED model reaches /api/chat (the fix end-to-end)", async () => {
  let hit = null;
  KOS.ai._config({ fetch: (url, opts) => { if (/\/api\/chat$/.test(String(url))) hit = JSON.parse(opts.body).model; return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve({ message: { content: "ok" }, done_reason: "stop" }) }); } });
  KOS.ai.setRouting("crud", "ollama", "qwen3:4b-instruct");
  await new Promise(res => KOS.ai.chat("crud", { messages: [{ role: "user", content: "hi" }] }, () => res()));
  assert(hit === "qwen3:4b-instruct", "the configured model must reach /api/chat, got " + hit);
});

/* ============ 4 · the shared-controller submit path uses the model ====== */
console.log("== orchestrator submit path uses the configured model ==");

step("a new-conversation submit routes to the configured Ollama model (not empty)", async () => {
  KOS.ai.orchestrator._config({ auditApi: { insert: (r, cb) => cb(null), update: (i, p, cb) => cb(null) } });
  KOS.ai.setRouting("complex", "ollama", "qwen3:4b-instruct");   // drawer/page submits use "complex"
  let modelAtChat = null;
  KOS.ai._config({ fetch: (url, opts) => {
    if (/\/api\/chat$/.test(String(url))) { modelAtChat = JSON.parse(opts.body).model; return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve({ message: { content: "hello" }, done_reason: "stop" }) }); }
    return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve({}) });
  } });
  KOS.assistant.newConversation();
  KOS.assistant.submit("hello");
  // wait for the orchestrator's async prep + provider turn
  await tick(400);
  assert(modelAtChat === "qwen3:4b-instruct",
    "a fresh-conversation submit must reach /api/chat with the configured model, got " + modelAtChat);
});

/* ============ the fix is present in the source ============ */
console.log("== fix source contract ==");

step("the Settings model input saves on `input`, not only `change`", async () => {
  const src = fs.readFileSync(path.join(ROOT, "js/modules/assistant.js"), "utf8");
  assert(/modelIn\.addEventListener\("input", save\)/.test(src),
    "the model input must persist on `input` (the unsaved-value fix)");
  assert(/ollamaIn\.addEventListener\("input"/.test(src),
    "the ollama endpoint input must persist on `input` too");
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
  if (failed) { console.error("SMOKE25 FAILED — " + failed + " step(s)"); process.exit(1); }
  console.log("SMOKE25 PASS — Ollama model-config path verified (" + steps.length + " steps).");
  process.exit(0);
})();
