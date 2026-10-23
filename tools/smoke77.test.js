/* Kurenai OS — smoke77.test.js
   Code (roadmap 5.3), part 5: the full C# runtime for units 7+ (decision
   A, Spike W, frame 26g). The runtime itself — Roslyn and .NET in
   WebAssembly — is held to native .NET outside this gate by
   tools/cs_wasm_check.mjs and tools/cs_diff.mjs; this suite holds the
   wiring around it.

     A · WHICH RUNNER. The sandbox units (7–9, 11, 12) and capstone 3 use
         the full runtime; units 1–6, Bridge B and capstones 1–2 do not.
     B · OPT-IN. Until the device has asked for it, a run that needs the
         runtime answers "needs the full runtime" at once and makes no
         worker; the error card offers the download, and the dialog opens
         on its offer with Not now and Download.
     C · THE SANDBOX. The worker removes fetch, XMLHttpRequest, WebSocket,
         IndexedDB and Cache Storage before the first program, and listens
         with addEventListener (an onmessage handler stops .NET starting).
     D · CACHING. The service worker keeps the runtime cache-first in its
         own kos-csharp-<id> cache, which a deploy's clean-up leaves alone;
         the worker script is precached; the ids agree everywhere.
     E · NOT COMMITTED, ALWAYS SHIPPED. The build output is gitignored and
         the deploy script builds it when missing and checks every file.

   Run:
     npm install jsdom fake-indexeddb   (one-time)
     node tools/smoke77.test.js                                            */
"use strict";
const fs = require("fs");
const path = require("path");
const { boot } = require("./lib/app-harness");
const ROOT = path.join(__dirname, "..");
const read = (f) => fs.readFileSync(path.join(ROOT, f), "utf8");

const steps = [];
function step(name, fn) { steps.push([name, fn]); }
function assert(c, m) { if (!c) throw new Error(m); }

step("A · the sandbox units use the full runtime, the rest the interpreter", async (app) => {
  const C = app.KOS.code;
  ["7.1", "8.9", "9.5", "11.2", "12.2", "12.13", "C3"].forEach((r) => assert(C.runnerFor(r) === "wasm", r + " should use the full runtime"));
  ["1.1", "4.6", "5.9", "6.2", "6.10", "B.2", "C1", "C2"].forEach((r) => assert(C.runnerFor(r) === "interp", r + " should use the interpreter"));
});

step("B · without the opt-in, a sandbox run asks for the runtime and makes no worker", async (app) => {
  const K = app.KOS, R = K.codeRun;
  R._reset();
  delete K.store.state.ui.code.runtime;
  made = 0;
  const r = await R.run({ files: [{ name: "Program.cs", src: "record P(int X);" }], lesson: "7.1" });
  assert(!r.ok && r.error.kind === "runtime", "a run that needs the runtime says so: " + JSON.stringify(r.error));
  assert(made === 0, "no worker was started without the opt-in");
  const card = K.codeUI.errorCard(r.error);
  assert(card.getAttribute("data-ui") === "code.runtime-card" && card.querySelector("[data-ui~='code.runtime-get']"), "the error card offers the download");
  const c = await R.check({ mode: "program", cases: [{ stdin: "", out: "x" }], lesson: "7.1" }, [{ name: "Program.cs", src: "" }]);
  assert(c.compile && c.compile.kind === "runtime" && !c.passed, "a check reports it once, like a compile error");
  const d = K.codeUI.runtimeOffer();
  await app.settle();
  const dlg = app.document.querySelector("[data-ui~='code.runtime-dialog']");
  assert(dlg && dlg.getAttribute("data-state") === "absent", "the dialog opens on the offer");
  assert(dlg.querySelector("[data-ui~='code.runtime-download']") && /Not now/.test(dlg.textContent) && /Nothing is uploaded/.test(dlg.textContent), "Download, Not now and the privacy line");
  d.close();
  assert(!K.store.state.ui.code.runtime, "opening the offer wants nothing yet");
});

step("C · the worker seals the network before learner code", async () => {
  const w = read("js/labs/cs-wasm-worker.js");
  ["fetch", "XMLHttpRequest", "WebSocket", "EventSource", "indexedDB", "caches", "BroadcastChannel"].forEach((k) => assert(new RegExp('"' + k + '"').test(w), "the worker removes " + k));
  assert(/seal\(\);\s*\n\s*runner = exports\.Runner/.test(w), "sealed after the warm-up, before the first request");
  assert(/self\.addEventListener\("message"/.test(w) && !/self\.onmessage\s*=/.test(w), "messages through addEventListener, never self.onmessage");
});

step("D · cache-first in its own cache; the ids agree", async () => {
  const sw = read("sw.js"), run = read("js/core/coderun.js"), prog = read("tools/cs-wasm/Program.cs");
  assert(/assets\\\/code\\\/runtime/.test(sw) && /"kos-csharp-" \+ rt\[1\]/.test(sw), "the service worker routes the runtime to kos-csharp-<id>");
  assert(/n\.indexOf\("kos-csharp-"\) !== 0/.test(sw), "a deploy's clean-up keeps the runtime cache");
  assert(/"js\/labs\/cs-wasm-worker\.js"/.test(sw), "the worker script is precached");
  const id = /RUNTIME_ID = "([^"]+)"/.exec(run)[1];
  assert(new RegExp('const string Version = "' + id.replace(/\./g, "\\.") + '"').test(prog), "coderun.js and the runner agree on the id " + id);
});

step("E · built, not committed; the deploy builds and checks it", async () => {
  const gi = read(".gitignore"), dep = read("tools/deploy_pages.sh");
  assert(/^assets\/code\/runtime\/$/m.test(gi) && /^tools\/cs-wasm\/bin\/$/m.test(gi), "the build output is gitignored");
  assert(/tools\/build_cs_wasm\.sh/.test(dep) && /the full runtime is missing/.test(dep), "the deploy builds the runtime when missing and checks every file");
  assert(fs.existsSync(path.join(ROOT, "tools/build_cs_wasm.sh")) && fs.existsSync(path.join(ROOT, "tools/cs-wasm/CsWasm.csproj")), "the build script and the project");
});

step("F · settings show the runtime and draw without writing", async (app) => {
  const K = app.KOS;
  const before = JSON.stringify(K.store.state.code) + JSON.stringify(K.store.state.ui.code.runtime);
  K.show("code", { page: "settings" }); await app.settle();
  const st = app.document.querySelector("[data-ui~='code.runtime-state']");
  assert(st && /Not downloaded/.test(st.textContent) && st.querySelector("[data-ui~='code.runtime-offer']"), "settings: not downloaded, with Download…");
  assert(before === JSON.stringify(K.store.state.code) + JSON.stringify(K.store.state.ui.code.runtime), "drawing settings wrote nothing");
  assert(app.errors.length === 0, "errors: " + app.errors.join(" | "));
});

/* jsdom has no Worker: a stub that counts and never answers stands in, so
   the page reads "not downloaded" (as a browser would) rather than "file" */
let made = 0;
(async () => {
  let failed = 0;
  const app = await boot();
  app.window.Worker = function () { made++; return { postMessage() {}, terminate() {} }; };
  for (const [name, fn] of steps) {
    try { await fn(app); console.log("  ok  " + name); }
    catch (e) { failed++; console.log("  FAIL " + name + "\n       " + e.message); }
  }
  console.log("\n" + "=".repeat(30));
  if (failed) { console.log("SMOKE77 FAIL — " + failed + " step(s)"); process.exit(1); }
  console.log("SMOKE77 PASS — Code's full C# runtime: wiring (" + steps.length + " steps).");
})();
