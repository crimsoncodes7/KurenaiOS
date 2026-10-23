/* Kurenai OS — labs/sql-run.js
   Code's SQL runner (Spike S, docs/code-plan.md §12.1; T1's Databases
   part): SQLite in WebAssembly (sql.js, assets/code/sqlite/), one fresh
   in-memory database a run. Pure over the SQL module it is handed, so the
   same file runs in the sealed worker (js/labs/sql-worker.js) and in Node
   (tools/lib/sql-node.js, tools/sql_diff.mjs).

   A run executes the seed (the lesson's dataset, silently), then the
   learner's SQL one statement at a time, and writes what each statement
   gives as TEXT into stdout, so the checker, predict items and tasks
   compare it exactly as they compare a C# program's output:
     a query    its columns and rows as an aligned table, then a blank line;
                no rows prints the header and "(no rows)";
     a change   INSERT, UPDATE, DELETE, REPLACE: "3 rows changed.";
     anything else (CREATE, BEGIN, COMMIT …) prints nothing.
   NULL prints as NULL; a number prints as JavaScript writes it (sql.js
   hands a REAL 2.0 back as 2 — typeof() tells them apart); a BLOB as
   x'…' hex. The first error stops the run: what printed before it stays,
   and the error carries SQLite's own words.                                */
(function (root) {
  "use strict";
  var MAX_ROWS = 200;

  function cell(v) {
    if (v === null || v === undefined) return "NULL";
    if (typeof v === "number") return String(v);
    if (v instanceof Uint8Array) {
      var h = ""; for (var i = 0; i < v.length; i++) h += (v[i] < 16 ? "0" : "") + v[i].toString(16);
      return "x'" + h + "'";
    }
    return String(v);
  }
  /* columns and rows → an aligned text table */
  function table(columns, rows) {
    var cells = rows.map(function (r) { return r.map(cell); });
    var w = columns.map(function (c, i) {
      return cells.reduce(function (m, r) { return Math.max(m, r[i].length); }, String(c).length);
    });
    var line = function (vals) { return vals.map(function (v, i) { return i === vals.length - 1 ? v : v + " ".repeat(w[i] - v.length); }).join(" | ").replace(/\s+$/, ""); };
    var out = [line(columns.map(String)), w.map(function (n) { return "-".repeat(n); }).join("-+-")];
    if (!cells.length) out.push("(no rows)");
    cells.slice(0, MAX_ROWS).forEach(function (r) { out.push(line(r)); });
    if (cells.length > MAX_ROWS) out.push("… " + (cells.length - MAX_ROWS) + " more rows");
    return out.join("\n");
  }
  var CHANGE = /^\s*(?:--[^\n]*\n\s*|\/\*[\s\S]*?\*\/\s*)*(insert|update|delete|replace)\b/i;
  function changed(n) { return n + (n === 1 ? " row changed." : " rows changed."); }

  /* run(SQL, {src, seed}) → {ok, stdout, error, sets, ms} */
  function run(SQL, req) {
    var t0 = Date.now(), parts = [], sets = [], db = null;
    var done = function (err) {
      try { if (db) db.close(); } catch (e) { /* closed */ }
      return { ok: !err, stdout: parts.join("\n"), error: err || null, sets: sets, ms: Date.now() - t0 };
    };
    try { db = new SQL.Database(); } catch (e) { return done({ kind: "runner", msg: "SQLite could not start: " + (e && e.message || e) }); }
    if (req.seed) {
      try { db.exec(req.seed); } catch (e) { return done({ kind: "seed", msg: "The lesson's dataset did not load: " + (e && e.message || e) }); }
    }
    var src = String(req.src || "");
    try {
      var it = db.iterateStatements(src);
      for (var stmt = it.next(); !stmt.done; stmt = it.next()) {
        var st = stmt.value, sql = st.getSQL(), cols = st.getColumnNames(), rows = [];
        while (st.step()) rows.push(st.get());
        st.free();
        if (cols.length) {
          sets.push({ columns: cols, rows: rows });
          parts.push(table(cols, rows) + "\n");
        } else if (CHANGE.test(sql)) {
          parts.push(changed(db.getRowsModified()));
        }
      }
    } catch (e) {
      return done({ kind: "sql", msg: String(e && e.message || e) });
    }
    return done(null);
  }

  var api = { run: run, table: table, cell: cell, MAX_ROWS: MAX_ROWS };
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.KOSQL = api;
})(typeof self !== "undefined" ? self : this);
