/* tools/lib/sql-node.js — Code's SQL runner in Node: the vendored sql.js
   (assets/code/sqlite/) and the same pure runner the worker uses
   (js/labs/sql-run.js). loadSql() → { run(req) } */
"use strict";
const path = require("path");
const ROOT = path.join(__dirname, "..", "..");
const KOSQL = require(path.join(ROOT, "js/labs/sql-run.js"));
let ready = null;
function loadSql() {
  if (!ready) ready = require(path.join(ROOT, "assets/code/sqlite/sql-wasm.js"))({ locateFile: (f) => path.join(ROOT, "assets/code/sqlite", f) })
    .then((SQL) => ({ SQL, run: (req) => KOSQL.run(SQL, req) }));
  return ready;
}
module.exports = { loadSql, KOSQL };
