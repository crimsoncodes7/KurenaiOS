/* Kurenai OS — labs/sql-worker.js
   The sealed worker for Code's SQL runner (Spike S; invariant 105's
   sandbox, for SQL). It loads SQLite in WebAssembly (sql.js) and the pure
   runner (sql-run.js), then REMOVES the network — fetch, XMLHttpRequest,
   WebSocket, EventSource, importScripts, IndexedDB, Cache Storage and
   BroadcastChannel — before the first learner statement. Every run is a
   fresh in-memory database; no app data is ever here. The page's watchdog
   terminates the worker if a run does not answer in time.               */
"use strict";
importScripts("../../assets/code/sqlite/sql-wasm.js", "sql-run.js");
var ready = self.initSqlJs({ locateFile: function (f) { return "../../assets/code/sqlite/" + f; } }).then(function (SQL) {
  ["fetch", "XMLHttpRequest", "WebSocket", "EventSource", "importScripts", "indexedDB", "caches", "BroadcastChannel"].forEach(function (k) {
    try { Object.defineProperty(self, k, { value: undefined, configurable: false, writable: false }); } catch (e) { try { self[k] = undefined; } catch (e2) { /* gone */ } }
  });
  return SQL;
});
self.addEventListener("message", function (ev) {
  var d = ev.data || {};
  ready.then(function (SQL) {
    self.postMessage({ id: d.id, res: self.KOSQL.run(SQL, d.req || {}) });
  }, function (e) {
    self.postMessage({ id: d.id, res: { ok: false, stdout: "", error: { kind: "runner", msg: "SQLite could not load: " + (e && e.message || e) }, sets: [], ms: 0 } });
  });
});
