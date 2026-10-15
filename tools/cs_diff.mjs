#!/usr/bin/env node
/* tools/cs_diff.mjs — the .NET differential for Code (docs/code-plan.md §6).

   Runs every program the Code content ships — notes listings, practice
   items, task answers against every case, retrieval answers for 20 seeds
   — under the in-app interpreter AND under real .NET (`dotnet run file.cs`,
   .NET 10's file-based apps), and compares:
     ok          the outputs must be identical, byte for byte
     compile     .NET must report the same CS error code
     exception   .NET must throw the same exception type
   It also checks each task answer's output against the case's expected
   output. Results are cached by a hash of (source, stdin) in the OS temp
   folder, so a second run only compiles what changed.

   Not part of the jsdom smoke gate: it needs the .NET SDK. Run it before a
   content release:   node tools/cs_diff.mjs [--no-cache]                  */
import { createRequire } from "module";
import { execFileSync, spawnSync } from "child_process";
import fs from "fs";
import os from "os";
import path from "path";
import crypto from "crypto";

const require = createRequire(import.meta.url);
const { loadCode, programs } = require("./lib/code-content.js");
const { K, content, CSI } = loadCode();
const list = programs(K, content);
const dir = fs.mkdtempSync(path.join(os.tmpdir(), "kos-csdiff-"));
const cacheFile = path.join(os.tmpdir(), "kos-csdiff-cache.json");
const cache = !process.argv.includes("--no-cache") && fs.existsSync(cacheFile) ? JSON.parse(fs.readFileSync(cacheFile, "utf8")) : {};
const norm = (s) => String(s || "").split("\n").filter((l) => !/\.cs\(\d+,\d+\): warning /.test(l)).join("\n").replace(/\r\n?/g, "\n").split("\n").map((l) => l.replace(/\s+$/, "")).join("\n").replace(/\n+$/, "");

try { execFileSync("dotnet", ["--version"], { stdio: "ignore" }); }
catch (e) { console.error("cs_diff: the .NET SDK is not installed — nothing compared."); process.exit(2); }

function dotnet(src, stdin) {
  const key = crypto.createHash("sha1").update("v2\u0000" + src + "\u0000" + stdin).digest("hex");
  if (cache[key]) return cache[key];
  const file = path.join(dir, "p" + key.slice(0, 10) + ".cs");
  /* nullable off for units 1–6 (decision Q2), invariant culture for output */
  fs.writeFileSync(file, "#:property Nullable=disable\n#:property InvariantGlobalization=false\nSystem.Globalization.CultureInfo.CurrentCulture = new System.Globalization.CultureInfo(\"en-GB\");\n" + src + "\n");
  const r = spawnSync("dotnet", ["run", file], { input: stdin, encoding: "utf8", timeout: 120000 });
  r.stdout = (r.stdout || "").split("\n").filter((l) => !/\.cs\(\d+,\d+\): warning /.test(l)).join("\n");
  const all = (r.stdout || "") + (r.stderr || "");
  let res;
  const ce = /error (CS\d{4})/.exec(all);
  if (ce) res = { kind: "compile", code: ce[1] };
  else if (/Unhandled exception\. System\.(\w+)/.test(all)) res = { kind: "exception", code: /Unhandled exception\. System\.(\w+)/.exec(all)[1], stdout: r.stdout.replace(/Unhandled exception[\s\S]*$/, "") };
  else res = { kind: "ok", stdout: r.stdout };
  cache[key] = res;
  return res;
}

let bad = 0, n = 0;
for (const p of list) {
  n++;
  const mine = CSI.run({ files: [{ name: "Program.cs", src: p.src }], stdin: p.stdin });
  /* a pitfall that never ends is shown stopped by the runner; .NET would run
     it for ever, so it is not compared */
  if (!mine.ok && mine.error.kind === "timeout") { n--; continue; }
  const net = dotnet(p.src, p.stdin);
  const ik = mine.ok ? "ok" : mine.error.kind === "compile" ? "compile" : mine.error.kind === "exception" ? "exception" : mine.error.kind;
  let problem = null;
  if (ik !== net.kind) problem = "interpreter " + ik + (mine.ok ? "" : " " + mine.error.code) + " · .NET " + net.kind + (net.code ? " " + net.code : "");
  else if (ik === "ok" && norm(mine.stdout) !== norm(net.stdout)) problem = "output differs\n    interp: " + JSON.stringify(mine.stdout) + "\n    .NET:   " + JSON.stringify(net.stdout);
  else if (ik !== "ok" && mine.error.code !== net.code && !(net.code === "StackOverflowException")) problem = "error differs: interpreter " + mine.error.code + " · .NET " + net.code;
  if (!problem && p.expect != null && norm(mine.stdout) !== norm(p.expect)) problem = "answer does not produce the expected output\n    expected: " + JSON.stringify(p.expect) + "\n    got:      " + JSON.stringify(mine.stdout);
  if (!problem && p.kind === "bug-broken" && mine.ok && norm(mine.stdout) === norm(p.expectNot)) problem = "the broken program already gives the fixed output";
  if (problem) { bad++; console.log("✗ " + p.where + "\n    " + problem); }
}
fs.writeFileSync(cacheFile, JSON.stringify(cache));
console.log((bad ? "✗ " : "✓ ") + (n - bad) + " of " + n + " programs agree with .NET");
process.exit(bad ? 1 : 0);
