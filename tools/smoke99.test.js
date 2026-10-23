/* Kurenai OS — smoke99.test.js
   Code's SQL runner (Spike S, docs/code-plan.md §12.1; T1's Databases
   part). SQLite in WebAssembly (sql.js 1.14.2, assets/code/sqlite/) under
   the pure runner js/labs/sql-run.js. tools/sql_diff.mjs additionally holds
   every SQL program to native SQLite; this suite holds the contract.

     A · WHAT A RUN PRINTS. A query as an aligned table (NULL as NULL, no
         rows as "(no rows)"), a change as "N rows changed.", nothing for
         DDL or a transaction; the seed loads silently; every run is a
         fresh database; the first error stops the run in SQLite's words
         and keeps what printed before it.
     B · WHAT SQL CAN DO. JOIN, GROUP BY with HAVING, a window, a CTE, a
         transaction rolled back and a savepoint, constraints that refuse,
         foreign keys once switched on.
     C · THE SANDBOX. The worker loads SQLite, then removes the network
         before any learner SQL; messages through addEventListener; the
         page creates it only on the first SQL run, routes lang "sql" to
         it, and on file:// says SQL needs http(s).
     D · OFFLINE AND LAZY. The service worker precaches the worker's two
         scripts but never SQLite itself, which is cache-first in its own
         kos-sqlite cache kept across deploys; the vendored files carry
         their licence.

   Run:
     npm install jsdom fake-indexeddb   (one-time)
     node tools/smoke99.test.js                                            */
"use strict";
const fs = require("fs");
const path = require("path");
const { loadSql } = require("./lib/sql-node.js");
const { boot } = require("./lib/app-harness");
const ROOT = path.join(__dirname, "..");
const read = (f) => fs.readFileSync(path.join(ROOT, f), "utf8");

const steps = [];
function step(name, fn) { steps.push([name, fn]); }
function assert(c, m) { if (!c) throw new Error(m); }
function eq(a, b, m) { if (a !== b) throw new Error(m + "\n--- got\n" + a + "\n--- want\n" + b); }
const SEED = "CREATE TABLE p (id INTEGER PRIMARY KEY, name TEXT NOT NULL UNIQUE, cat TEXT, price REAL CHECK (price > 0));\n" +
  "INSERT INTO p VALUES (1,'Tea','drinks',1.5),(2,'Coffee','drinks',2.2),(3,'Mug',NULL,8);\n" +
  "CREATE TABLE o (id INTEGER PRIMARY KEY, p_id INTEGER REFERENCES p(id), qty INTEGER);\n" +
  "INSERT INTO o VALUES (1,1,2),(2,1,1),(3,3,1);";
let S;

step("A · what a run prints", async () => {
  let r = S.run({ seed: SEED, src: "SELECT name, cat FROM p ORDER BY id;\nSELECT * FROM p WHERE 0;" });
  eq(r.stdout, "name   | cat\n-------+-------\nTea    | drinks\nCoffee | drinks\nMug    | NULL\n\nid | name | cat | price\n---+------+-----+------\n(no rows)\n", "a table, NULL, and no rows");
  r = S.run({ seed: SEED, src: "CREATE TABLE x (a);\nBEGIN;\nINSERT INTO x VALUES (1), (2);\nUPDATE x SET a = 3 WHERE a = 1;\nCOMMIT;" });
  eq(r.stdout, "2 rows changed.\n1 row changed.", "changes counted, DDL and the transaction silent");
  r = S.run({ seed: SEED, src: "SELECT count(*) AS n FROM p;\nSELECT nme FROM p;\nSELECT 1;" });
  assert(!r.ok && r.error.kind === "sql" && r.error.msg === "no such column: nme" && /^n\n-\n3\n/.test(r.stdout), "the first error stops the run, in SQLite's words, keeping what printed: " + JSON.stringify(r));
  r = S.run({ seed: SEED, src: "SELECT count(*) AS n FROM x;" });
  assert(!r.ok && r.error.msg === "no such table: x", "every run is a fresh database: x from the last run is gone");
  r = S.run({ seed: "CREATE TABLE broken (", src: "SELECT 1;" });
  assert(!r.ok && r.error.kind === "seed", "a broken dataset is the lesson's fault, said so");
  r = S.run({ src: "SELECT 7 / 2, 7 / 2.0, typeof(2.0), x'0aff', NULL;" });
  assert(/^7 \/ 2 \| 7 \/ 2\.0 \| typeof\(2\.0\) \| x'0aff' \| NULL/.test(r.stdout) && /3     \| 3\.5     \| real/.test(r.stdout) && /x'0aff'/.test(r.stdout.split("\n")[2]), "numbers as JavaScript writes them, blobs as hex: " + r.stdout);
});

step("B · joins, grouping, windows, CTEs, transactions and constraints", async () => {
  const q = (src) => S.run({ seed: SEED, src });
  eq(q("SELECT p.name, sum(o.qty) AS sold FROM p LEFT JOIN o ON o.p_id = p.id GROUP BY p.id HAVING sold IS NOT NULL ORDER BY sold DESC;").stdout,
    "name | sold\n-----+-----\nTea  | 3\nMug  | 1\n", "a LEFT JOIN, GROUP BY and HAVING");
  eq(q("SELECT name, rank() OVER (ORDER BY price DESC) AS r FROM p ORDER BY r;").stdout, "name   | r\n-------+--\nMug    | 1\nCoffee | 2\nTea    | 3\n", "a window function");
  eq(q("WITH RECURSIVE n(x) AS (SELECT 1 UNION ALL SELECT x + 1 FROM n WHERE x < 4) SELECT group_concat(x, '') AS s FROM n;").stdout, "s\n----\n1234\n", "a recursive CTE");
  eq(q("BEGIN;\nDELETE FROM o;\nROLLBACK;\nSELECT count(*) AS n FROM o;").stdout, "3 rows changed.\nn\n-\n3\n", "a rollback undoes");
  eq(q("BEGIN;\nINSERT INTO o VALUES (4, 2, 5);\nSAVEPOINT s;\nDELETE FROM o WHERE id = 4;\nROLLBACK TO s;\nCOMMIT;\nSELECT qty FROM o WHERE id = 4;").stdout, "1 row changed.\n1 row changed.\nqty\n---\n5\n", "a savepoint");
  assert(q("INSERT INTO p (name, price) VALUES ('Tea', 1);").error.msg === "UNIQUE constraint failed: p.name", "UNIQUE refuses");
  assert(q("INSERT INTO p (name, price) VALUES ('Air', 0);").error.msg === "CHECK constraint failed: price > 0", "CHECK refuses");
  assert(q("INSERT INTO o VALUES (9, 99, 1);").ok, "foreign keys are off by default, as in SQLite");
  assert(q("PRAGMA foreign_keys = ON;\nINSERT INTO o VALUES (9, 99, 1);").error.msg === "FOREIGN KEY constraint failed", "and enforced once switched on");
});

step("C · the sandbox: sealed worker, lazy, routed", async () => {
  const w = read("js/labs/sql-worker.js");
  ["fetch", "XMLHttpRequest", "WebSocket", "EventSource", "importScripts", "indexedDB", "caches", "BroadcastChannel"].forEach((k) => assert(new RegExp('"' + k + '"').test(w), "the worker removes " + k));
  assert(/initSqlJs\([\s\S]*\)\.then\(function \(SQL\) \{\s*\[/.test(w), "sealed as soon as SQLite has loaded, before any request is answered");
  assert(/ready\.then\(function \(SQL\)/.test(w), "every request waits for the sealed module");
  assert(/self\.addEventListener\("message"/.test(w) && !/self\.onmessage\s*=/.test(w), "messages through addEventListener");
  const run = read("js/core/coderun.js");
  assert(/req\.lang === "sql" \|\| req\.runner === "sql"\) return sqlRun\(req\)/.test(run) && /new window\.Worker\("js\/labs\/sql-worker\.js"\)/.test(run), "lang sql goes to its own worker");
  assert(/sqlw = sqlw \|\| sqlMake\(\)/.test(run), "the worker is made on the first SQL run, not at boot");
  const app = await boot();
  assert(!app.document.querySelector('script[src*="sql-wasm"], script[src*="sql-run"]'), "the page loads no SQL script");
  const r = await app.KOS.codeRun.run({ lang: "sql", src: "SELECT 1;" });
  assert(!r.ok && r.error.code === "SQL_UNAVAILABLE" && /http\(s\)/.test(r.error.msg), "without a worker it says so: " + JSON.stringify(r.error));
  assert(app.KOS.codeRun.explain({ kind: "sql", code: "SQL", msg: "x" }).kind === "SQLite error", "the error card names SQLite");
  app.window.close();
});

step("D · offline and lazy in the service worker; the licence ships", async () => {
  const sw = read("sw.js");
  assert(/"js\/labs\/sql-worker\.js",\s*\n\s*"js\/labs\/sql-run\.js"/.test(sw), "the two worker scripts are precached");
  assert(!/sql-wasm/.test(sw.slice(sw.indexOf("EXTRA_PRECACHE"), sw.indexOf("];", sw.indexOf("EXTRA_PRECACHE")))), "SQLite itself is not precached");
  assert(/var SQLITE_CACHE = "kos-sqlite-1\.14\.2"/.test(sw) && /caches\.open\(sq \? SQLITE_CACHE/.test(sw), "cache-first in kos-sqlite-<version>");
  assert(/n !== SQLITE_CACHE\) return caches\.delete\(n\)/.test(sw), "a deploy's clean-up keeps it");
  assert(/MIT/.test(read("assets/code/sqlite/LICENSE")) && fs.statSync(path.join(ROOT, "assets/code/sqlite/sql-wasm.wasm")).size > 500000, "the vendored build and its licence");
  assert(/sql\.js@?\s*1\.14\.2|sql\.js\) 1\.14\.2|sql\.js 1\.14\.2/.test(read("assets/code/sqlite/README.md")) && /var SQLITE_CACHE = "kos-sqlite-1\.14\.2"/.test(sw), "the cache name follows the vendored version");
});

(async () => {
  let failed = 0;
  S = await loadSql();
  for (const [name, fn] of steps) {
    try { await fn(); console.log("  ok  " + name); }
    catch (e) { failed++; console.log("  FAIL " + name + "\n       " + e.message); }
  }
  console.log("\n" + "=".repeat(30));
  if (failed) { console.log("SMOKE99 FAIL — " + failed + " step(s)"); process.exit(1); }
  console.log("SMOKE99 PASS — Code's SQL runner (" + steps.length + " steps).");
})();
