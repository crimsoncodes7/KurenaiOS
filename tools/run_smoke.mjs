#!/usr/bin/env node
/* tools/run_smoke.mjs — the smoke gate in parallel (audit AP-12; `npm test`).

   Discovers every tools/smoke*.test.js (so a new suite joins by being
   written), runs them as child processes with a pool of workers, kills a
   suite that passes its timeout, prints one line per suite as it ends and a
   summary sorted by time, and exits 1 if any suite failed or timed out.
   A failed suite's last lines of output are printed under the summary.

     node tools/run_smoke.mjs                  every suite, os.cpus()-1 workers
     node tools/run_smoke.mjs 4 56 115         only smoke4, smoke56, smoke115 ("" or 1 = smoke.test.js)
     --jobs N        workers (default os.cpus()-1, at least 1; env SMOKE_JOBS)
     --timeout S     seconds a suite may take (default 300; env SMOKE_TIMEOUT)
     --repeat N      run the selection N times (hunting flaky suites)
     --tail N        lines of a failed suite's output to print (default 40)
     --skip 75,76    leave these suites out (env SMOKE_SKIP); each is named
                     in the summary so a skip is never silent
     --list          print the suites it would run and stop
     --heavy-timeout S  the heavy suites' limit, and a re-run's (default 900;
                     env SMOKE_HEAVY_TIMEOUT)
     --no-retry      do not re-run a failed suite alone at the end

   The heavy suites (smoke56, smoke75) start first so the pool ends evenly,
   with their own longer limit. A suite that fails or times out in the pool
   is run again ALONE after it (the tail batch); the summary names every
   suite that only passed alone, and one that fails alone fails the gate.

   WHAT A SUITE NEEDS BEYOND NODE (checked 8 November 2026, clean clone):
     smoke75, smoke76  the full C# runtime, assets/code/runtime/<id>/ —
                       gitignored, built by tools/build_cs_wasm.sh with the
                       .NET 10 SDK; without it both FAIL by design. CI skips
                       them (.github/workflows/smoke.yml).
     smoke90 H         python3 + openpyxl and the user's A-level folder
                       (KOS_ALEVEL or ~/Downloads/A-level); skips itself.
     smoke39, smoke90  git (ls-files), present wherever the repo is.
   SQL (sql.js) is vendored, so smoke99 needs nothing. The differentials
   (cs_diff, sql_diff, fsrs_check, cs_wasm_check, validator_check) are not
   smoke suites and are never run here.                                     */
import { spawn } from "node:child_process";
import { readdirSync } from "node:fs";
import { cpus } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const TOOLS = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(TOOLS, "..");

const args = process.argv.slice(2);
function opt(name, dflt) {
  const i = args.indexOf(name);
  if (i < 0) return dflt;
  const v = args[i + 1];
  args.splice(i, 2);
  return v;
}
const jobs = Math.max(1, +opt("--jobs", process.env.SMOKE_JOBS || Math.max(1, cpus().length - 1)) || 1);
const timeoutS = Math.max(1, +opt("--timeout", process.env.SMOKE_TIMEOUT || 300) || 300);
const repeat = Math.max(1, +opt("--repeat", 1) || 1);
const tailN = Math.max(0, +opt("--tail", 40) || 0);
const skipArg = opt("--skip", process.env.SMOKE_SKIP || "");
const listOnly = args.includes("--list");
const picks = args.filter((a) => !a.startsWith("--"));

const num = (f) => { const m = /^smoke(\d*)\.test\.js$/.exec(f); return m ? (m[1] ? +m[1] : 1) : null; };
let suites = readdirSync(TOOLS).filter((f) => num(f) !== null).sort((a, b) => num(a) - num(b));
if (picks.length) {
  const want = new Set(picks.map((p) => (p === "" || p === "1" ? 1 : +String(p).replace(/^smoke|\.test\.js$/g, ""))));
  suites = suites.filter((f) => want.has(num(f)));
  if (!suites.length) { console.error("run_smoke: no suite matches " + picks.join(" ")); process.exit(2); }
}
const skipped = [];
if (skipArg) {
  const out = new Set(String(skipArg).split(",").map((x) => x.trim()).filter(Boolean).map((x) => (x === "1" ? 1 : +x.replace(/^smoke|\.test\.js$/g, ""))));
  suites = suites.filter((f) => (out.has(num(f)) ? (skipped.push(f), false) : true));
}
/* longest first: the two that are ~40% of the gate's CPU. Each takes about
   six minutes even alone, so it gets its own, longer limit (W8, 17 Nov
   2026: both were killed at 300 s under a full parallel load). */
const HEAVY = ["smoke56.test.js", "smoke75.test.js"];
const heavyS = Math.max(timeoutS, +opt("--heavy-timeout", process.env.SMOKE_HEAVY_TIMEOUT || 900) || 900);
/* A suite that fails or times out in the parallel pool is run again ALONE
   once the pool is empty (the tail batch). Several suites wait on the wall
   clock for a few seconds (smoke9, 20, 53), which a starved CPU can miss; a
   real failure fails again alone, so it is still a failure. --no-retry
   turns the tail batch off. */
const retry = !args.includes("--no-retry");
suites.sort((a, b) => (HEAVY.indexOf(b) - HEAVY.indexOf(a)) || num(a) - num(b));
if (listOnly) { suites.forEach((s) => console.log(s)); process.exit(0); }

const queue = [];
for (let r = 0; r < repeat; r++) suites.forEach((s) => queue.push(s));
const t0 = Date.now();
const label = (s) => s.replace(/\.test\.js$/, "");

function run(file, alone) {
  return new Promise((resolve) => {
    const started = Date.now();
    const child = spawn(process.execPath, [path.join(TOOLS, file)], { cwd: ROOT, env: process.env, stdio: ["ignore", "pipe", "pipe"] });
    const out = [];
    child.stdout.on("data", (d) => out.push(d));
    child.stderr.on("data", (d) => out.push(d));
    let timedOut = false;
    const limit = alone || HEAVY.includes(file) ? heavyS : timeoutS;
    const timer = setTimeout(() => { timedOut = true; child.kill("SIGKILL"); }, limit * 1000);
    child.on("close", (code, signal) => {
      clearTimeout(timer);
      const ms = Date.now() - started;
      const ok = code === 0 && !timedOut;
      const r = { file, ok, code, signal, timedOut, ms, alone: !!alone, output: Buffer.concat(out).toString("utf8") };
      const why = timedOut ? "TIMEOUT after " + limit + " s" : ok ? "" : "exit " + (code == null ? signal : code);
      console.log((ok ? "  ok   " : alone || !retry ? "  FAIL " : "  again") + label(file).padEnd(10) + String((ms / 1000).toFixed(1)).padStart(7) + " s" +
        (alone ? "   (alone)" : "") + (why ? "   " + why : ""));
      resolve(r);
    });
  });
}

console.log("run_smoke: " + queue.length + " suite run(s), " + jobs + " worker(s), " + timeoutS + " s timeout (" +
  HEAVY.map(label).join(", ") + " " + heavyS + " s)" + (retry ? ", failures re-run alone at the end" : "") +
  (skipped.length ? "; SKIPPED: " + skipped.map(label).join(" ") : ""));
const first = [];
async function worker() { while (queue.length) first.push(await run(queue.shift())); }
await Promise.all(Array.from({ length: Math.min(jobs, queue.length) }, worker));
/* the tail batch: each suite that failed under load, alone, one at a time */
const rerun = retry ? first.filter((r) => !r.ok) : [];
if (rerun.length) console.log("\nrun_smoke: " + rerun.length + " failed under load; running each alone: " + rerun.map((r) => label(r.file)).join(" "));
const second = [];
for (const r of rerun) second.push(await run(r.file, true));
const results = first.map((r) => second.find((s) => s.file === r.file && !r.ok) || r);
const recovered = second.filter((r) => r.ok).map((r) => label(r.file));

const failed = results.filter((r) => !r.ok);
const wall = ((Date.now() - t0) / 1000).toFixed(1);
const cpu = (first.concat(second).reduce((s, r) => s + r.ms, 0) / 1000).toFixed(0);
console.log("\nslowest: " + results.slice().sort((a, b) => b.ms - a.ms).slice(0, 5).map((r) => label(r.file) + " " + (r.ms / 1000).toFixed(0) + " s").join(", "));
failed.forEach((r) => {
  console.log("\n---- " + label(r.file) + (r.timedOut ? " (timed out)" : " (exit " + r.code + ")") + ": last " + tailN + " lines ----");
  console.log(r.output.trimEnd().split("\n").slice(-tailN).join("\n"));
});
console.log("\nrun_smoke: " + (results.length - failed.length) + " / " + results.length + " passed in " + wall + " s wall (" + cpu + " s summed)" +
  (recovered.length ? "; passed alone after failing under load: " + recovered.join(" ") : "") +
  (skipped.length ? "; skipped " + skipped.map(label).join(" ") : "") +
  (failed.length ? "; FAILED: " + [...new Set(failed.map((r) => label(r.file)))].join(" ") : ""));
process.exit(failed.length ? 1 : 0);
