/* Kurenai OS — smoke26.test.js
   Category 6 Phase F regression: the Ollama request-payload compatibility
   layer. Fixes the live 400 "request (8832 tokens) exceeds the available
   context size (4096 tokens)" — a small local model can't take all ~80 tool
   schemas. Adds deterministic tool shortlisting (≤12), an Ollama-only schema
   sanitizer, tools/format conflict avoidance, and surfaces Ollama's real
   error body.

   Run:
     npm install jsdom fake-indexeddb   (one-time)
     node tools/smoke26.test.js

   PROVES:
   1. plain local chat (no tools) succeeds and sends no tools/format;
   2. a minimal tool request succeeds and the tool_call is parsed;
   3. unsupported/validation-only schema keywords are stripped RECURSIVELY
      from transmitted tool params (additionalProperties, maxLength, pattern,
      minimum, …), keeping type/description/enum/properties/required/items;
   4. Phase B validation is UNCHANGED locally (the registry still enforces
      the full strict schema — the strip only affects what's transmitted);
   5. a tools+format request omits `format` (no tool-vs-JSON conflict);
   6. tool shortlisting is deterministic, ≤12, category+view relevant, and
      EXCLUDES irrelevant categories (cloud models still get all tools);
   7. an Ollama error body is surfaced safely (redacted) in the message. */

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

const steps = [];
function step(name, fn) { steps.push([name, fn]); }
const tick = ms => new Promise(r => setTimeout(r, ms || 0));
function assert(cond, msg) { if (!cond) throw new Error(msg); }
function pchat(provider, model, req) {
  return new Promise(res => KOS.ai.chatWith(provider, model, req, (e, r) => res({ err: e, res: r })));
}
let lastBody = null;
function stub(responder) {
  KOS.ai._config({ fetch: (url, opts) => {
    if (String(url).includes("/api/chat")) { lastBody = JSON.parse(opts.body); return responder(url, opts); }
    return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve({}) });
  } });
}
const okReply = (content, toolCalls) => () => Promise.resolve({ ok: true, status: 200,
  json: () => Promise.resolve({ message: { content: content || "", tool_calls: toolCalls }, done_reason: "stop", prompt_eval_count: 10, eval_count: 5 }) });

/* ============ 1 · plain chat ============ */
console.log("== plain local chat ==");

step("plain chat (no tools) succeeds and sends neither tools nor format", async () => {
  assert(errors.length === 0, "load errors: " + errors.join(" | "));
  stub(okReply("hello from qwen"));
  const { err, res } = await pchat("ollama", "qwen3:4b-instruct", { messages: [{ role: "user", content: "hi" }] });
  assert(!err && res.text === "hello from qwen", "plain chat failed: " + (err && err.message));
  assert(lastBody.tools === undefined, "no tools must be sent on a plain chat");
  assert(lastBody.format === undefined, "no format must be sent on a plain chat");
  assert(lastBody.model === "qwen3:4b-instruct" && lastBody.stream === false, "body basics wrong");
});

/* ============ 2 · minimal tool ============ */
console.log("== minimal tool request ==");

step("a minimal tool request sends the tool and parses the tool_call", async () => {
  stub(okReply("", [{ function: { name: "add_task", arguments: { text: "revise" } } }]));
  const { err, res } = await pchat("ollama", "qwen3:4b-instruct", {
    messages: [{ role: "user", content: "add a task" }],
    tools: [{ name: "add_task", description: "add a task", parameters: { type: "object", properties: { text: { type: "string" } }, required: ["text"] } }]
  });
  assert(!err, "minimal tool chat failed: " + (err && err.message));
  assert(lastBody.tools && lastBody.tools[0].function.name === "add_task", "the tool must be sent");
  assert(res.toolCalls.length === 1 && res.toolCalls[0].name === "add_task" && res.toolCalls[0].args.text === "revise",
    "the tool_call must be parsed");
});

/* ============ 3 · schema sanitizer (recursive strip) ============ */
console.log("== ollama schema sanitizer ==");

step("validation-only keywords are stripped recursively from transmitted params", async () => {
  stub(okReply("ok"));
  const heavy = {
    type: "object", additionalProperties: false,
    properties: {
      entryId: { type: "integer", minimum: 1, maximum: 99 },
      changes: { type: "object", additionalProperties: false, properties: {
        status: { type: "string", enum: ["planned", "completed"] },
        note: { type: "string", maxLength: 500, minLength: 1, pattern: "^.+$" }
      }, required: ["status"] },
      tags: { type: "array", maxItems: 10, items: { type: "string", maxLength: 60 } }
    },
    required: ["entryId"]
  };
  await pchat("ollama", "qwen3:4b-instruct", {
    messages: [{ role: "user", content: "x" }],
    tools: [{ name: "collection_update_entry", description: "update", parameters: heavy }]
  });
  const sent = JSON.stringify(lastBody.tools[0].function.parameters);
  assert(!/additionalProperties|maxLength|minLength|pattern|minimum|maximum|maxItems|minItems/.test(sent),
    "validation-only keywords must be stripped: " + sent);
  const p = lastBody.tools[0].function.parameters;
  assert(p.type === "object" && p.required[0] === "entryId", "structure must survive");
  assert(p.properties.changes.properties.status.enum.length === 2, "enum (a selection hint) must survive nesting");
  assert(p.properties.tags.items.type === "string", "array item type must survive");
  assert(!("additionalProperties" in p.properties.changes), "nested additionalProperties must be stripped");
});

/* ============ 4 · Phase B validation UNCHANGED ============ */
console.log("== Phase B validation unchanged locally ==");

step("the registry still enforces the full strict schema (strip is transmit-only)", async () => {
  // unknown field still rejected
  let v = KOS.ai.tools.validate("todo_add_task", { text: "x", bogus: 1 });
  assert(!v.ok && v.errors.some(e => /unknown field/.test(e)), "unknown fields must still be rejected");
  // maxLength still enforced by the registry
  v = KOS.ai.tools.validate("todo_add_task", { text: "y".repeat(600) });
  assert(!v.ok && v.errors.some(e => /too long/.test(e)), "maxLength must still be enforced by validation");
  // enum still enforced
  v = KOS.ai.tools.validate("study_set_topic_status", { subject: "compsci", ref: "x", status: "bogus" });
  assert(!v.ok && v.errors.some(e => /must be one of/.test(e)), "enum must still be enforced");
  // a valid call still passes
  v = KOS.ai.tools.validate("todo_add_task", { text: "ok" });
  assert(v.ok, "a valid call must still pass");
});

/* ============ 5 · tools+format conflict avoided ============ */
console.log("== tools+format conflict avoidance ==");

step("a request with BOTH tools and structured omits format (tool turn wins)", async () => {
  stub(okReply("ok"));
  await pchat("ollama", "qwen3:4b-instruct", {
    messages: [{ role: "user", content: "x" }],
    tools: [{ name: "add_task", description: "add", parameters: { type: "object", properties: {} } }],
    structured: { schema: { type: "object", properties: { q: { type: "string" } } } }
  });
  assert(lastBody.tools && lastBody.format === undefined,
    "format must be omitted when tools are present (conflict avoidance)");
});

step("a pure generation request (structured, NO tools) still sends format", async () => {
  stub(okReply("{\"q\":\"x\"}"));
  const schema = { type: "object", properties: { q: { type: "string" } }, required: ["q"] };
  await pchat("ollama", "qwen3:4b-instruct", { messages: [{ role: "user", content: "gen" }], structured: { schema } });
  assert(JSON.stringify(lastBody.format) === JSON.stringify(schema), "a no-tools structured turn must still send format");
});

/* ============ 6 · deterministic tool shortlisting ============ */
console.log("== deterministic tool shortlisting ==");

step("shortlist is ≤12, universal-first, category+view relevant, deterministic", async () => {
  const all = KOS.ai.tools.names();
  assert(all.length > 60, "registry should be large");
  // crud + planner view → planner-heavy
  const crud = KOS.ai.tools.shortlist({ category: "crud", view: "tasks", max: 12 });
  assert(crud.length <= 12 && crud.length >= 6, "shortlist must be capped at 12, got " + crud.length);
  assert(crud[0] === "app_get_context" && crud[1] === "search_app", "universal tools must lead");
  assert(crud.includes("todo_add_task") && crud.includes("calendar_add_event"), "planner tools expected for tasks view");
  assert(!crud.includes("governor_buy_item"), "irrelevant governor tools must be excluded for a crud/tasks request");
  // determinism
  const crud2 = KOS.ai.tools.shortlist({ category: "crud", view: "tasks", max: 12 });
  assert(JSON.stringify(crud) === JSON.stringify(crud2), "shortlist must be deterministic");
  // context steers it: a collection view surfaces collection tools
  const onEntry = KOS.ai.tools.shortlist({ category: "complex", view: "anime", max: 12 });
  assert(onEntry.includes("collection_list_entries") || onEntry.includes("collection_get_entry"),
    "a collection view must surface collection tools");
  // generation category → study-focused
  const gen = KOS.ai.tools.shortlist({ category: "generation", view: "ref", max: 12 });
  assert(gen.includes("study_generate_flashcards") || gen.includes("study_get_topic"), "generation must surface study tools");
  // permission filter honoured
  const restricted = KOS.ai.tools.shortlist({ category: "crud", view: "tasks", max: 12, allowed: { has: n => n === "app_get_context" } });
  assert(restricted.length === 1 && restricted[0] === "app_get_context", "shortlist must intersect with allowed names");
});

step("the orchestrator shortlists ONLY for ollama; cloud providers get the full set", async () => {
  const orchSrc = fs.readFileSync(path.join(ROOT, "js/core/aiorchestrator.js"), "utf8");
  assert(/route\.provider === "ollama"/.test(orchSrc), "shortlisting must be gated on the ollama provider");
  assert(/KOS\.ai\.tools\.shortlist\(/.test(orchSrc), "the orchestrator must call the shortlist");
  assert(/var toolNames = allowed;/.test(orchSrc), "non-ollama providers must default to the full allowed set");
});

/* ============ 7 · surfaced error body ============ */
console.log("== ollama error body surfaced ==");

step("an Ollama 400 error body is surfaced (redacted) in the message", async () => {
  KOS.ai._config({ fetch: (url) => {
    if (String(url).includes("/api/chat")) {
      return Promise.resolve({ ok: false, status: 400,
        text: () => Promise.resolve(JSON.stringify({ error: { code: 400, message: "request (8832 tokens) exceeds the available context size (4096 tokens), try increasing it" } })) });
    }
    return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve({}) });
  } });
  const { err } = await pchat("ollama", "qwen3:4b-instruct", {
    messages: [{ role: "user", content: "x" }], noRetry: true,
    tools: [{ name: "t", description: "d", parameters: { type: "object", properties: {} } }]
  });
  assert(err && err.kind === "provider", "a 400 must be a provider error");
  assert(/exceeds the available context size/.test(err.message), "the real Ollama reason must be surfaced: " + err.message);
});

step("an error body that is a bare {error:string} is also surfaced", async () => {
  KOS.ai._config({ fetch: (url) => {
    if (String(url).includes("/api/chat")) return Promise.resolve({ ok: false, status: 400, text: () => Promise.resolve(JSON.stringify({ error: "invalid tool schema" })) });
    return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve({}) });
  } });
  const { err } = await pchat("ollama", "qwen3:4b-instruct", { messages: [{ role: "user", content: "x" }], noRetry: true });
  assert(err && /invalid tool schema/.test(err.message), "a bare {error:string} must surface too: " + (err && err.message));
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
  if (failed) { console.error("SMOKE26 FAILED — " + failed + " step(s)"); process.exit(1); }
  console.log("SMOKE26 PASS — Ollama request-payload compatibility verified (" + steps.length + " steps).");
  process.exit(0);
})();
