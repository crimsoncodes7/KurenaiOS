#!/usr/bin/env node
/* tools/sql_diff.mjs — Code's SQL against native SQLite (Spike S; T1's
   Databases part), as tools/cs_diff.mjs holds C# to .NET. Every program —
   the spike corpus (tools/sql_spike_corpus.js) and every SQL listing,
   practice item, task answer and card in the Code content (lang "sql") —
   runs under the app's runner (sql.js in Node, js/labs/sql-run.js) and
   under Python's own SQLite (tools/lib/sql_ref.py, the same formatting),
   and the two must print the same text and stop on the same error.
     node tools/sql_diff.mjs            every program
     node tools/sql_diff.mjs --show 12  print one program's two outputs   */
import { createRequire } from "module";
import { spawnSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
const require = createRequire(import.meta.url);
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const { loadSql } = require("./lib/sql-node.js");
const { programs: spike } = require("./sql_spike_corpus.js");
const { sqlPrograms } = require("./lib/code-content.js");

const all = spike.concat(sqlPrograms ? sqlPrograms() : []);
const S = await loadSql();
const mine = all.map((p) => S.run({ seed: p.seed, src: p.src }));
const ref = spawnSync("python3", ["-I", path.join(ROOT, "tools/lib/sql_ref.py")], { input: JSON.stringify(all.map((p) => ({ seed: p.seed, src: p.src }))), encoding: "utf8", maxBuffer: 1 << 28 });
if (ref.status !== 0) { console.error(ref.stderr); process.exit(2); }
const theirs = JSON.parse(ref.stdout);
const native = ref.stderr.trim();
const norm = (s) => String(s || "").replace(/\s+$/, "");
const show = process.argv.indexOf("--show") >= 0 ? +process.argv[process.argv.indexOf("--show") + 1] : null;
let bad = 0;
all.forEach((p, i) => {
  const a = mine[i], b = theirs[i];
  const same = norm(a.stdout) === norm(b.stdout) && !!a.ok === !!b.ok && (a.ok || a.error.msg === b.error.msg);
  if (show === i + 1 || !same) {
    console.log((same ? "= " : "✗ ") + p.where + "\n--- sql\n" + p.src + "\n--- app\n" + a.stdout + (a.error ? "\n[error] " + a.error.msg : "") + "\n--- native\n" + b.stdout + (b.error ? "\n[error] " + b.error.msg : "") + "\n");
  }
  if (!same) bad++;
  if (p.expect != null && norm(a.stdout) !== norm(p.expect)) { bad++; console.log("✗ " + p.where + ": the expected output is not what SQLite prints\n" + a.stdout + "\n"); }
});
console.log((bad ? "✗ " + bad + " of " : "✓ ") + all.length + " SQL program(s) agree with native SQLite " + native + " (the app runs sql.js's SQLite)");
process.exit(bad ? 1 : 0);
