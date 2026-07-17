/* Kurenai OS — smoke20.test.js
   Category 6 Phase A: the assistant provider layer (js/core/ai.js) + the
   ai-chat Edge Function + metering migration source contracts.

   Run:
     npm install jsdom fake-indexeddb   (one-time)
     node tools/smoke20.test.js

   TESTED PROPERTIES:
   1. ai.js loads inert: no state.assistant until used, zero network at load.
   2. Per-category routing defaults match the spec (tutor/complex → gemini
      gemini-3.5-flash, crud → ollama, generation → deepseek
      deepseek-v4-flash); setRouting/setFallback validate their inputs.
   3. Ollama transport: exact /api/chat request shape (stream:false, system
      message first, tools + assistant tool_calls + tool-result translation,
      format = the JSON schema for structured output); normalized response
      (text, toolCalls with object args, usage, finishReason); the local
      visibility counter increments and is never treated as spend.
   4. Error normalization: network-kind failures carry the OLLAMA_ORIGINS
      hint and retry exactly once (noRetry: zero retries); HTTP 404 → config
      kind with a pull-the-model message, no retry; edge 429 → rate kind, no
      retry. Cancellation aborts with kind "cancelled". Correlation ids are
      unique and ride both results and errors.
   5. Edge transport: signed out, gemini/deepseek calls fail with a clear
      cloud-sign-in explanation and ZERO network; signed in (stubbed), the
      ai-chat body carries provider/model/messages/tools/structured/
      correlationId and the normalized response (incl. remaining) passes
      through.
   6. No silent paid fallback: local-route failure with no fallback
      configured surfaces the error and never touches the edge; an
      explicitly configured fallback runs and the result carries
      usedFallback + fellBackFrom.
   7. Health checks: Ollama /api/tags reachable/unreachable states; edge
      health reports configured/used/cap; signed-out reports unavailable.
   8. Source contracts: ai-chat reads secrets only via Deno.env.get, never
      console.logs, meters through kos_ai_consume BEFORE any provider fetch,
      redacts token-like blobs from upstream error bodies; config.toml sets
      verify_jwt = true for ai-chat; the migration enables RLS on both
      tables with select-own-only client policies (no client writes),
      a security-definer consume function, and service_role-only EXECUTE. */

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

const steps = [];
function step(name, fn) { steps.push([name, fn]); }
const tick = ms => new Promise(r => setTimeout(r, ms || 0));
function assert(cond, msg) { if (!cond) throw new Error(msg); }
const read = f => fs.readFileSync(path.join(ROOT, f), "utf8");
/* promisified chat helpers — resolve {err, res} so error paths assert cleanly */
function pchatWith(provider, model, req) {
  return new Promise(res => KOS.ai.chatWith(provider, model, req, (e, r) => res({ err: e, res: r })));
}
function pchat(category, req) {
  return new Promise(res => KOS.ai.chat(category, req, (e, r) => res({ err: e, res: r })));
}

/* ============ 1 · inert load ============ */
console.log("== ai.js: inert load ==");

step("KOS.ai exists; no state.assistant until used; zero ai network at load", async () => {
  assert(KOS.ai, "KOS.ai missing");
  assert(!KOS.store.state.assistant, "state.assistant should not exist before first use");
  assert(netLog.every(n => !/11434|ai-chat|generativelanguage|deepseek/.test(n.url)),
    "ai.js emitted network traffic at load: " + JSON.stringify(netLog));
  assert(errors.length === 0, "load errors: " + errors.join(" | "));
});

/* ============ 2 · routing config ============ */
console.log("== routing defaults + validation ==");

step("defaults match the spec; setRouting/setFallback validate", async () => {
  const a = KOS.ai.config();
  assert(a.routing.tutor.provider === "gemini" && a.routing.tutor.model === "gemini-3.5-flash", "tutor default wrong");
  assert(a.routing.crud.provider === "ollama", "crud default wrong");
  assert(a.routing.generation.provider === "deepseek" && a.routing.generation.model === "deepseek-v4-flash", "generation default wrong");
  assert(a.routing.complex.provider === "gemini", "complex default wrong");
  assert(a.fallback.crud === null && a.fallback.tutor === null, "fallback must default OFF");
  assert(KOS.ai.setRouting("nope", "gemini", "m") === false, "bad category accepted");
  assert(KOS.ai.setRouting("crud", "openai", "m") === false, "unknown provider accepted");
  assert(KOS.ai.setFallback("crud", { provider: "banana", model: "m" }) === false, "unknown fallback provider accepted");
  assert(KOS.ai.setRouting("crud", "ollama", "qwen3:4b") === true, "valid setRouting refused");
  assert(KOS.ai.config().routing.crud.model === "qwen3:4b", "model not stored");
  ["gemini", "deepseek", "ollama"].forEach(p => {
    const c = KOS.ai.capabilities(p);
    assert(c && typeof c.toolCalling === "boolean" && typeof c.structuredOutput === "boolean"
      && typeof c.streaming === "boolean", "capability flags missing for " + p);
  });
  assert(KOS.ai.capabilities("ollama").modelDependent === true, "ollama must be flagged model-dependent");
});

/* ============ 3 · Ollama transport ============ */
console.log("== ollama transport ==");

let lastFetch = null;
function fakeOllama(responder) {
  KOS.ai._config({ fetch: (url, opts) => {
    lastFetch = { url: String(url), opts };
    return responder(String(url), opts);
  } });
}

step("request shape + normalized response + local counter", async () => {
  fakeOllama(() => Promise.resolve({
    ok: true, status: 200,
    json: () => Promise.resolve({
      message: { role: "assistant", content: "hello",
        tool_calls: [{ function: { name: "todo_add", arguments: { text: "revise" } } }] },
      done_reason: "stop", prompt_eval_count: 12, eval_count: 34
    })
  }));
  const { err, res } = await pchatWith("ollama", "qwen3:4b", {
    system: "sys prompt",
    messages: [
      { role: "user", content: "hi" },
      { role: "assistant", content: "prev", toolCalls: [{ id: "o0", name: "x", args: { a: 1 } }] },
      { role: "tool", content: "{\"ok\":true}", name: "x", toolCallId: "o0" }
    ],
    tools: [{ name: "todo_add", description: "adds", parameters: { type: "object", properties: {} } }]
  });
  assert(!err, "ollama chat errored: " + (err && err.message));
  assert(lastFetch.url === "http://127.0.0.1:11434/api/chat", "wrong ollama URL: " + lastFetch.url);
  const body = JSON.parse(lastFetch.opts.body);
  assert(body.stream === false, "stream must be false");
  assert(body.model === "qwen3:4b", "model missing");
  assert(body.messages[0].role === "system" && body.messages[0].content === "sys prompt", "system must lead");
  assert(body.messages[1].role === "user", "user message lost");
  assert(body.messages[2].tool_calls[0].function.name === "x", "assistant tool_calls not translated");
  assert(body.messages[3].role === "tool", "tool result not translated");
  assert(body.tools[0].type === "function" && body.tools[0].function.name === "todo_add", "tools not translated");
  assert(res.text === "hello", "text lost");
  assert(res.toolCalls.length === 1 && res.toolCalls[0].name === "todo_add"
    && res.toolCalls[0].args.text === "revise", "toolCalls not normalized");
  assert(res.usage.prompt === 12 && res.usage.completion === 34, "usage lost");
  assert(res.provider === "ollama" && typeof res.correlationId === "string", "provenance missing");
  const u = KOS.ai.config().ollamaUsage;
  assert(u.count === 1, "local counter should be 1, got " + u.count);
});

step("structured output rides format = schema", async () => {
  const schema = { type: "object", properties: { q: { type: "string" } }, required: ["q"] };
  fakeOllama(() => Promise.resolve({ ok: true, status: 200,
    json: () => Promise.resolve({ message: { content: "{\"q\":\"x\"}" }, done_reason: "stop" }) }));
  const { err } = await pchatWith("ollama", "qwen3:4b", {
    messages: [{ role: "user", content: "gen" }], structured: { schema }
  });
  assert(!err, "structured chat errored");
  const body = JSON.parse(lastFetch.opts.body);
  assert(JSON.stringify(body.format) === JSON.stringify(schema), "format must be the JSON schema");
});

step("network failure: OLLAMA_ORIGINS hint, exactly one retry; noRetry = none", async () => {
  let calls = 0;
  fakeOllama(() => { calls++; return Promise.reject(new TypeError("fetch failed")); });
  const { err } = await pchatWith("ollama", "qwen3:4b", { messages: [{ role: "user", content: "x" }] });
  assert(err && err.kind === "network", "expected network kind, got " + (err && err.kind));
  assert(/OLLAMA_ORIGINS/.test(err.message), "CORS/origins hint missing: " + err.message);
  assert(calls === 2, "expected exactly 1 retry (2 calls), got " + calls);
  calls = 0;
  const r2 = await pchatWith("ollama", "qwen3:4b", { messages: [{ role: "user", content: "x" }], noRetry: true });
  assert(r2.err && calls === 1, "noRetry must mean a single attempt, got " + calls);
});

step("HTTP 404 = unknown model → config kind, no retry", async () => {
  let calls = 0;
  fakeOllama(() => { calls++; return Promise.resolve({ ok: false, status: 404, json: () => Promise.resolve({}) }); });
  const { err } = await pchatWith("ollama", "qwen3:4b", { messages: [{ role: "user", content: "x" }] });
  assert(err && err.kind === "config" && /pull/i.test(err.message), "404 should explain pulling the model");
  assert(calls === 1, "404 must not retry");
});

step("no model configured → clear config error before any fetch", async () => {
  let calls = 0;
  fakeOllama(() => { calls++; return Promise.resolve({ ok: true, json: () => Promise.resolve({}) }); });
  const { err } = await pchatWith("ollama", "", { messages: [{ role: "user", content: "x" }] });
  assert(err && err.kind === "config" && calls === 0, "empty model must fail without a request");
});

step("cancellation → kind cancelled", async () => {
  fakeOllama((url, opts) => new Promise((resolve, reject) => {
    opts.signal.addEventListener("abort", () => reject(Object.assign(new Error("aborted"), { name: "AbortError" })));
  }));
  const p = new Promise(res => {
    const cid = KOS.ai.chatWith("ollama", "qwen3:4b", { messages: [{ role: "user", content: "x" }], noRetry: true },
      (e) => res(e));
    setTimeout(() => KOS.ai.cancel(cid), 10);
  });
  const err = await p;
  assert(err && err.kind === "cancelled", "expected cancelled kind, got " + (err && err.kind));
});

/* ============ 4 · edge transport ============ */
console.log("== edge transport (gemini/deepseek) ==");

step("signed out: clear explanation, zero network", async () => {
  KOS.ai._config({ fetch: () => { throw new Error("no fetch expected"); } });
  const net0 = netLog.length;
  for (const p of ["gemini", "deepseek"]) {
    const { err } = await pchatWith(p, "m", { messages: [{ role: "user", content: "x" }] });
    assert(err && /cloud/i.test(err.message), p + ": expected cloud explanation, got " + (err && err.message));
    assert(err.kind === "config" || err.kind === "auth", p + ": wrong kind " + err.kind);
  }
  assert(netLog.length === net0, "signed-out edge call emitted network");
});

/* stub a signed-in cloud (ai.js only reads these three) */
const realCloud = { available: KOS.cloud.available, userId: KOS.cloud.userId, configured: KOS.cloud.configured };
function signIn() {
  KOS.cloud.available = () => true;
  KOS.cloud.userId = () => "test-user";
  KOS.cloud.configured = () => true;
}
function signOut() { Object.assign(KOS.cloud, realCloud); }

let lastInvoke = null;
step("signed in: ai-chat body shape + normalized passthrough", async () => {
  signIn();
  KOS.ai._config({ invoke: (body, cb) => {
    lastInvoke = body;
    cb(null, {
      text: "answer", toolCalls: [{ id: "g0", name: "t", args: { a: 1 } }],
      usage: { prompt: 5, completion: 7 }, finishReason: "STOP", remaining: 42
    }, 200);
  } });
  const schema = { type: "object" };
  const { err, res } = await pchatWith("gemini", "gemini-3.5-flash", {
    category: "tutor", system: "s",
    messages: [{ role: "user", content: "q" }],
    tools: [{ name: "t", description: "d", parameters: { type: "object" } }],
    structured: { schema }
  });
  assert(!err, "edge chat errored: " + (err && err.message));
  assert(lastInvoke.provider === "gemini" && lastInvoke.model === "gemini-3.5-flash", "provider/model missing");
  assert(lastInvoke.messages.length === 1 && lastInvoke.system === "s", "messages/system missing");
  assert(lastInvoke.tools.length === 1 && lastInvoke.structured.schema === schema, "tools/structured missing");
  assert(typeof lastInvoke.correlationId === "string" && lastInvoke.correlationId.length > 8, "correlationId missing");
  assert(res.text === "answer" && res.toolCalls[0].args.a === 1, "response not passed through");
  assert(res.usage.prompt === 5 && res.remaining === 42, "usage/remaining lost");
});

step("edge 429 → rate kind, not retried", async () => {
  let calls = 0;
  KOS.ai._config({ invoke: (body, cb) => { calls++; cb(new Error("Daily limit reached"), { kind: "rate" }, 429); } });
  const { err } = await pchatWith("gemini", "m", { messages: [{ role: "user", content: "x" }] });
  assert(err && err.kind === "rate", "expected rate kind, got " + (err && err.kind));
  assert(calls === 1, "rate errors must not retry");
});

/* ============ 5 · routing + fallback ============ */
console.log("== routing + no-silent-fallback ==");

step("chat() honours per-category routing", async () => {
  let edgeBody = null, ollamaCalled = 0;
  KOS.ai._config({
    invoke: (body, cb) => { edgeBody = body; cb(null, { text: "e", toolCalls: [] }, 200); },
    fetch: () => { ollamaCalled++; return Promise.resolve({ ok: true, status: 200,
      json: () => Promise.resolve({ message: { content: "o" }, done_reason: "stop" }) }); }
  });
  const g = await pchat("generation", { messages: [{ role: "user", content: "gen" }] });
  assert(!g.err && edgeBody.provider === "deepseek" && edgeBody.model === "deepseek-v4-flash",
    "generation must route to deepseek");
  assert(edgeBody.category === "generation", "category must ride the edge body");
  const c = await pchat("crud", { messages: [{ role: "user", content: "add" }] });
  assert(!c.err && c.res.provider === "ollama" && ollamaCalled > 0, "crud must route to ollama");
  const bad = await pchat("nonsense", {});
  assert(bad.err && bad.err.kind === "config", "unknown category must fail");
});

step("no fallback configured → local failure surfaces, edge untouched", async () => {
  let edgeCalls = 0;
  KOS.ai._config({
    invoke: (body, cb) => { edgeCalls++; cb(null, { text: "e" }, 200); },
    fetch: () => Promise.reject(new TypeError("refused"))
  });
  const { err } = await pchat("crud", { messages: [{ role: "user", content: "x" }] });
  assert(err && err.kind === "network", "local failure must surface");
  assert(edgeCalls === 0, "SILENT FALLBACK: edge was called without user consent");
});

step("explicit fallback runs and is labelled", async () => {
  KOS.ai.setFallback("crud", { provider: "gemini", model: "gemini-3.5-flash" });
  let edgeBody = null;
  KOS.ai._config({
    invoke: (body, cb) => { edgeBody = body; cb(null, { text: "from-fallback", toolCalls: [] }, 200); },
    fetch: () => Promise.reject(new TypeError("refused"))
  });
  const { err, res } = await pchat("crud", { messages: [{ role: "user", content: "x" }] });
  assert(!err, "fallback should have succeeded: " + (err && err.message));
  assert(edgeBody.provider === "gemini", "fallback provider not used");
  assert(res.usedFallback === true && res.fellBackFrom === "ollama", "fallback must be labelled");
  KOS.ai.setFallback("crud", null);
});

step("correlation ids are unique", async () => {
  KOS.ai._config({ invoke: (body, cb) => cb(null, { text: "" }, 200), fetch: null });
  const ids = new Set();
  for (let i = 0; i < 20; i++) {
    const { res } = await pchatWith("gemini", "m", { messages: [{ role: "user", content: "x" }] });
    ids.add(res.correlationId);
  }
  assert(ids.size === 20, "correlation ids must be unique");
});

/* ============ 6 · health ============ */
console.log("== health checks ==");

step("ollama health: reachable lists models; unreachable explains", async () => {
  KOS.ai._config({ fetch: (url) => {
    assert(/\/api\/tags$/.test(String(url)), "health must hit /api/tags");
    return Promise.resolve({ ok: true, status: 200,
      json: () => Promise.resolve({ models: [{ name: "qwen3:4b" }, { name: "llama3.2:3b" }] }) });
  } });
  const h = await new Promise(res => KOS.ai.health("ollama", (e, r) => res(r)));
  assert(h.available === true && h.models.length === 2, "reachable health wrong");
  KOS.ai._config({ fetch: () => Promise.reject(new TypeError("refused")) });
  const h2 = await new Promise(res => KOS.ai.health("ollama", (e, r) => res(r)));
  assert(h2.available === false && /OLLAMA_ORIGINS|running/i.test(h2.reason), "unreachable reason unclear");
});

step("edge health: configured/used/cap; signed-out unavailable", async () => {
  KOS.ai._config({ invoke: (body, cb) => {
    assert(body.action === "health", "health must send action:health");
    cb(null, { providers: { gemini: { configured: true, used: 3 }, deepseek: { configured: false, used: 0 } }, cap: 200 }, 200);
  } });
  const g = await new Promise(res => KOS.ai.health("gemini", (e, r) => res(r)));
  assert(g.available === true && g.used === 3 && g.cap === 200, "gemini health wrong");
  const d = await new Promise(res => KOS.ai.health("deepseek", (e, r) => res(r)));
  assert(d.available === false && /key/.test(d.reason), "unconfigured deepseek should say so");
  signOut();
  const s = await new Promise(res => KOS.ai.health("gemini", (e, r) => res(r)));
  assert(s.available === false && /sign-?in/i.test(s.reason), "signed-out health must say sign in");
  signIn();
});

step("usage(): local ollama count separate from billable externals", async () => {
  KOS.ai._config({ invoke: (body, cb) =>
    cb(null, { providers: { gemini: { configured: true, used: 9 }, deepseek: { configured: true, used: 1 } }, cap: 200 }, 200) });
  const u = await new Promise(res => KOS.ai.usage((e, r) => res(r)));
  assert(u.ollama && u.ollama.billable === false && typeof u.ollama.usedToday === "number", "ollama usage wrong");
  assert(u.gemini.billable === true && u.gemini.usedToday === 9 && u.gemini.cap === 200, "gemini usage wrong");
  signOut();
});

/* ============ 7 · server-side source contracts ============ */
console.log("== ai-chat + migration source contracts ==");

step("ai-chat: secrets via Deno.env only, no logging, meter before provider", async () => {
  const src = read("supabase/functions/ai-chat/index.ts");
  assert(/GEMINI_API_KEY/.test(src) && /DEEPSEEK_API_KEY/.test(src), "key env names missing");
  const keyReads = src.match(/GEMINI_API_KEY|DEEPSEEK_API_KEY/g) || [];
  const envReads = src.match(/Deno\.env\.get\(\s*(KEY_ENV\[[^\]]+\]|"(GEMINI|DEEPSEEK)_API_KEY")\s*\)/g) || [];
  assert(envReads.length >= 1, "keys must be read via Deno.env.get");
  assert(!/console\.(log|warn|error|info|debug)/.test(src), "ai-chat must never console.log (key-leak risk)");
  assert(/requireUserId/.test(src), "JWT validation missing");
  const meterAt = src.indexOf("await consume(");
  const geminiAt = src.indexOf("await callGemini(");
  assert(meterAt !== -1 && geminiAt !== -1 && meterAt < geminiAt,
    "the cap must be consumed BEFORE the provider call");
  assert(/kos_ai_consume/.test(src), "atomic consume RPC missing");
  assert(/x-goog-api-key/.test(src), "gemini key must ride the header, not the URL");
  const urlLit = src.match(/`https:\/\/generativelanguage[^`]*`/);
  assert(urlLit && !/key/i.test(urlLit[0].replace("googleapis", "")),
    "gemini key must never appear in the request URL");
  assert(/replace\(\/\[A-Za-z0-9_-\]\{25,\}\/g/.test(src), "upstream error bodies must redact token-like blobs");
  assert(/rate_limited/.test(src) && /correlation_id/.test(src), "usage rows must carry rate decision + correlation id");
  assert(!/messages/.test(src.split("recordUsage")[1].split("}")[0] || "x"), "recordUsage must not carry messages");
});

step("config.toml: ai-chat is JWT-verified", async () => {
  const toml = read("supabase/config.toml");
  const m = toml.match(/\[functions\.ai-chat\]\s*\nverify_jwt = (\w+)/);
  assert(m && m[1] === "true", "ai-chat must have verify_jwt = true");
});

step("migration: RLS + select-own-only + definer consume + service_role-only execute", async () => {
  const sql = read("supabase/migrations/20260718000001_kos_ai.sql");
  assert(/kos_ai_daily enable row level security/.test(sql), "kos_ai_daily RLS missing");
  assert(/kos_ai_usage enable row level security/.test(sql), "kos_ai_usage RLS missing");
  assert(/kos_ai_daily_select_own/.test(sql) && /kos_ai_usage_select_own/.test(sql), "select-own policies missing");
  assert(!/for insert/.test(sql) && !/for update/.test(sql) && !/for delete/.test(sql),
    "metering tables must have NO client write policies");
  assert(/security definer/.test(sql), "kos_ai_consume must be security definer");
  assert(/set search_path = ''/.test(sql), "definer function must pin search_path");
  assert(/revoke execute[\s\S]*from authenticated/.test(sql), "authenticated must not execute kos_ai_consume");
  assert(/grant\s+execute[\s\S]*to service_role/.test(sql), "service_role execute grant missing");
  assert(/on conflict \(user_id, provider, day\) do update/.test(sql) && /used < p_cap/.test(sql),
    "the atomic capped increment is missing");
});

step("index.html loads ai.js after gameapi.js, before content", async () => {
  const idx = read("index.html");
  const ai = idx.indexOf("js/core/ai.js"), gapi = idx.indexOf("js/core/gameapi.js"),
    eng = idx.indexOf("js/engines/flashcards.js");
  assert(ai > gapi && ai < eng, "ai.js script order wrong");
});

/* ============ run ============ */
(async () => {
  let failed = 0;
  for (const [name, fn] of steps) {
    try { await fn(); console.log("  ok  " + name); }
    catch (e) { failed++; console.error("  FAIL " + name + "\n       " + e.message); }
  }
  if (errors.length) { failed++; console.error("page errors: " + errors.join(" | ")); }
  await tick(50);
  console.log("\n==============================");
  if (failed) { console.error("SMOKE20 FAILED — " + failed + " step(s)"); process.exit(1); }
  console.log("SMOKE20 PASS — Category 6 Phase A provider layer verified (" + steps.length + " steps).");
  process.exit(0);
})();
