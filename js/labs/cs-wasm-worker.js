/* Kurenai OS — labs/cs-wasm-worker.js
   The full C# runner's worker (units 7+; docs/code-plan.md decision A,
   Spike W). A module worker: it loads .NET WebAssembly and the compiler
   from assets/code/runtime/<id>/ (built by tools/build_cs_wasm.sh), warms
   the compiler once, then removes every way out — fetch, XMLHttpRequest,
   WebSocket, EventSource, IndexedDB, Cache Storage, BroadcastChannel —
   before the first learner program runs (the sandbox invariant). It
   answers the in-app interpreter's protocol: postMessage({id, req}) →
   {id, res}, so the checker and the pages need nothing new. It boots as
   soon as it is created (started from inside a message handler, .NET's
   start-up never finishes), and requests wait for it (they arrive through
   addEventListener — see below); progress and
   readiness are reported as {type: "progress" | "ready" | "failed"}.      */
const ID = new URL(self.location.href).searchParams.get("id") || "";
const BASE = new URL("../../assets/code/runtime/" + ID + "/", self.location.href).href;
let ready = null, runner = null;

function seal() {
  ["fetch", "XMLHttpRequest", "WebSocket", "EventSource", "indexedDB", "caches", "BroadcastChannel", "importScripts", "Request"].forEach((k) => {
    try { Object.defineProperty(self, k, { value: undefined, writable: false, configurable: false }); }
    catch (e) { try { self[k] = undefined; } catch (e2) { /* read-only: nothing more to do */ } }
  });
}

async function boot() {
  const t0 = performance.now();
  const stage = (m) => self.postMessage({ type: "stage", m, ms: Math.round(performance.now() - t0) });
  stage("import");
  const { dotnet } = await import(BASE + "dotnet.js");
  stage("create");
  /* progress by files fetched, against the runtime's own manifest */
  let total = 0, loaded = 0;
  try { const m = await (await fetch(BASE + "kurenai-runtime.json")).json(); total = m.files.length; } catch (e) { total = 0; }
  const rt = await dotnet
    .withResourceLoader((type, name, defaultUri) => {
      if (type === "dotnetjs") return defaultUri;
      return fetch(defaultUri).then((r) => { loaded++; self.postMessage({ type: "progress", loaded, total: Math.max(total, loaded) }); return r; });
    })
    .create();
  stage("exports");
  const exports = await rt.getAssemblyExports("CsWasm");
  stage("warm");
  const warm = Number(exports.Runner.Warm());
  seal();
  runner = exports.Runner;
  self.postMessage({ type: "ready", ms: Math.round(performance.now() - t0), warm });
}

ready = boot();
ready.catch(() => { /* reported below, per request */ });
/* addEventListener, never self.onmessage: with an onmessage handler set,
   .NET takes the worker for one of its own threads and never starts */
self.addEventListener("message", async (ev) => {
  const msg = ev.data || {};
  try { await ready; }
  catch (e) {
    self.postMessage({ type: "failed", msg: String((e && e.message) || e) });
    if (msg.id) self.postMessage({ id: msg.id, res: { ok: false, stdout: "", steps: 0, ms: 0,
      error: { code: "RUNTIME", kind: "runtime", msg: "The full C# runtime could not start: " + String((e && e.message) || e), line: 0 } } });
    return;
  }
  if (!msg.id) return;
  let res;
  try { res = JSON.parse(await runner.Run(JSON.stringify(msg.req || {}))); }
  catch (e) { res = { ok: false, stdout: "", steps: 0, ms: 0, error: { code: "INTERNAL", kind: "internal", msg: String((e && e.message) || e), line: 0 } }; }
  self.postMessage({ id: msg.id, res });
});
