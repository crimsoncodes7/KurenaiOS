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
   folder, so a second run only compiles what changed. A program from a
   sandbox unit (7–9, 11) runs under the full C# runner that ships to the
   browser (.NET WebAssembly, tools/lib/cs-wasm-node.js) instead of the
   interpreter, with nullable reference types on, against native .NET with
   the same settings.

   Not part of the jsdom smoke gate: it needs the .NET SDK. Run it before a
   content release:   node tools/cs_diff.mjs [--no-cache]                  */
import { createRequire } from "module";
import { execFileSync, spawn } from "child_process";
import fs from "fs";
import os from "os";
import path from "path";
import crypto from "crypto";

const require = createRequire(import.meta.url);
const { loadCode, programs, runnerOf } = require("./lib/code-content.js");
const { loadWasm } = require("./lib/cs-wasm-node.js");
const { K, content, CSI, data } = loadCode();
const list = programs(K, content).map((p) => Object.assign(p, { runner: runnerOf(K, data, p.lesson) }));
const wasm = list.some((p) => p.runner === "wasm") ? await loadWasm() : null;
if (list.some((p) => p.runner === "wasm") && !wasm) { console.error("cs_diff: units 7+ need the full runtime — run tools/build_cs_wasm.sh"); process.exit(2); }
const dir = fs.mkdtempSync(path.join(os.tmpdir(), "kos-csdiff-"));
const cacheFile = path.join(os.tmpdir(), "kos-csdiff-cache.json");
const cache = !process.argv.includes("--no-cache") && fs.existsSync(cacheFile) ? JSON.parse(fs.readFileSync(cacheFile, "utf8")) : {};
const norm = (s) => String(s || "").split("\n").filter((l) => !/\.cs\(\d+,\d+\): warning /.test(l)).join("\n").replace(/\r\n?/g, "\n").split("\n").map((l) => l.replace(/\s+$/, "")).join("\n").replace(/\n+$/, "");

try { execFileSync("dotnet", ["--version"], { stdio: "ignore" }); }
catch (e) { console.error("cs_diff: the .NET SDK is not installed — nothing compared."); process.exit(2); }

/* .NET's verdict for one program, cached; compiles run several at a time */
const keyOf = (src, stdin, files, full) => crypto.createHash("sha1").update("v2\u0000" + src + "\u0000" + stdin + (files && Object.keys(files).length ? "\u0000fs" + JSON.stringify(files) : "") + (full ? "\u0000full" : "")).digest("hex");
function run(file, stdin, cwd) {
  return new Promise((resolve) => {
    const child = spawn("dotnet", ["run", file], { cwd, env: Object.assign({}, process.env, { DOTNET_CLI_TELEMETRY_OPTOUT: "1", DOTNET_NOLOGO: "1" }) });
    let out = "", err = "";
    const t = setTimeout(() => child.kill("SIGKILL"), 120000);
    child.stdout.on("data", (d) => { out += d; });
    child.stderr.on("data", (d) => { err += d; });
    child.on("close", () => { clearTimeout(t); resolve({ stdout: out, stderr: err }); });
    child.stdin.on("error", () => { /* closed early */ });
    child.stdin.end(stdin || "");
  });
}
async function dotnet(src, stdin, files, full) {
  /* a program that reads or writes files runs in a fresh folder holding
     its seed files (the in-app runner's in-memory disk) */
  const fsTag = files && Object.keys(files).length ? "\u0000fs" + JSON.stringify(files) : "";
  const key = keyOf(src, stdin, files, full);
  if (cache[key]) return cache[key];
  const file = path.join(dir, "p" + key.slice(0, 10) + ".cs");
  /* nullable off for units 1–6 (decision Q2), invariant culture for output */
  /* using directives must come before the culture line we insert */
  const lines = src.split("\n"), usings = [];
  while (lines.length && /^\s*using\s+[\w.]+\s*;\s*$/.test(lines[0])) usings.push(lines.shift());
  /* units 1–6: nullable off (decision Q2); 7+: on, and JSON as a normal project has it */
  fs.writeFileSync(file, (full ? "#:property Nullable=enable\n#:property JsonSerializerIsReflectionEnabledByDefault=true\n" : "#:property Nullable=disable\n") + "#:property InvariantGlobalization=false\n" + usings.map((u) => u + "\n").join("") + "System.Globalization.CultureInfo.CurrentCulture = new System.Globalization.CultureInfo(\"en-GB\");\n" + lines.join("\n") + "\n");
  /* every program runs in a fresh folder, so one that writes a file never
     leaves it in the repository (or in the next program's way) */
  const cwd = fs.mkdtempSync(path.join(dir, "fs-"));
  if (fsTag) {
    for (const [name, text] of Object.entries(files)) {
      const target = path.join(cwd, name);
      fs.mkdirSync(path.dirname(target), { recursive: true });
      if (!name.endsWith("/")) fs.writeFileSync(target, text && typeof text === "object" && typeof text.hex === "string" ? Buffer.from(text.hex, "hex") : text);
    }
  }
  const r = await run(file, stdin, cwd);
  r.stdout = (r.stdout || "").split("\n").filter((l) => !/\.cs\(\d+,\d+\): warning /.test(l)).join("\n");
  const all = (r.stdout || "") + (r.stderr || "");
  let res;
  const ce = /error (CS\d{4})/.exec(all);
  if (ce) res = { kind: "compile", code: ce[1] };
  else if (/^Stack overflow\./m.test(all)) res = { kind: "exception", code: "StackOverflowException", stdout: r.stdout };
  else if (/Unhandled exception\. System\.([\w.]+)/.test(all)) res = { kind: "exception", code: /Unhandled exception\. System\.([\w.]+)/.exec(all)[1].split(".").pop(), stdout: r.stdout.replace(/Unhandled exception[\s\S]*$/, "") };
  else res = { kind: "ok", stdout: r.stdout };
  cache[key] = res;
  return res;
}

/* 1 · every program in the app's own runner */
for (const p of list) {
  p.full = p.runner === "wasm";
  p.mine = p.full ? await wasm.run({ files: [{ name: "Program.cs", src: p.src }], stdin: p.stdin, fs: p.fs, nullable: true })
    : CSI.run({ files: [{ name: "Program.cs", src: p.src }], stdin: p.stdin, fs: p.fs });
}
/* 2 · .NET for each one not yet cached, JOBS at a time, the cache saved as
   it goes (a pitfall that never ends is shown stopped by the runner; .NET
   would run it for ever, so it is not compared) */
const todo = list.filter((p) => !(!p.mine.ok && p.mine.error.kind === "timeout") && !cache[keyOf(p.src, p.stdin, p.fs, p.full)]);
const JOBS = Math.max(2, Math.min(6, os.cpus().length - 2));
if (todo.length) console.log("compiling " + todo.length + " program(s) with .NET, " + JOBS + " at a time…");
let next = 0, doneN = 0;
await Promise.all(Array.from({ length: JOBS }, async () => {
  while (next < todo.length) {
    const p = todo[next++];
    await dotnet(p.src, p.stdin, p.fs, p.full);
    if (++doneN % 25 === 0) { fs.writeFileSync(cacheFile, JSON.stringify(cache)); process.stdout.write("  " + doneN + " of " + todo.length + "\n"); }
  }
}));
fs.writeFileSync(cacheFile, JSON.stringify(cache));

/* 3 · compare */
let bad = 0, n = 0;
for (const p of list) {
  n++;
  const mine = p.mine;
  if (!mine.ok && mine.error.kind === "timeout") { n--; continue; }
  const net = await dotnet(p.src, p.stdin, p.fs, p.full);
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
