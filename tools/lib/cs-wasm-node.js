/* tools/lib/cs-wasm-node.js — the full C# runner (assets/code/runtime/<id>/,
   built by tools/build_cs_wasm.sh) in Node, for tools/cs_diff.mjs and
   tools/cs_wasm_check.mjs: the same Runner.Run the browser worker calls.

     const wasm = await loadWasm();      // null when it has not been built
     const res = await wasm.run(req);    // the interpreter's result shape  */
"use strict";
const fs = require("fs");
const path = require("path");
const { pathToFileURL } = require("url");
const ROOT = path.join(__dirname, "..", "..");

async function loadWasm() {
  const id = /RUNTIME_ID = "([^"]+)"/.exec(fs.readFileSync(path.join(ROOT, "js/core/coderun.js"), "utf8"))[1];
  const dir = path.join(ROOT, "assets/code/runtime", id);
  if (!fs.existsSync(path.join(dir, "dotnet.js"))) return null;
  const { dotnet } = await import(pathToFileURL(path.join(dir, "dotnet.js")).href);
  const t0 = Date.now();
  const rt = await dotnet.create();
  const runner = (await rt.getAssemblyExports("CsWasm")).Runner;
  const warm = Number(runner.Warm());
  return { id, bootMs: Date.now() - t0, warmMs: warm, run: async (req) => JSON.parse(await runner.Run(JSON.stringify(req))) };
}

module.exports = { loadWasm };
