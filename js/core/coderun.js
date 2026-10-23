/* Kurenai OS — core/coderun.js
   The runner and the checker for Code (roadmap 5.3, docs/code-plan.md §7).

   RUN. Learner code goes to the in-app runner (js/labs/cs-interp.js) in a
   Worker: no network, no DOM, no app data (the sandbox invariant). The
   page keeps a watchdog: a run that has not answered in 4 seconds has its
   worker terminated and reads "Did not finish". Browsers refuse workers
   on file://, so there — and in the jsdom suites — the same interpreter
   runs in the page, loaded on first use.

   CHECK. A task is checked by running it, never by matching its text:
     program  each case feeds stdin and compares the output, line by line,
              ignoring trailing spaces and the last newline;
     method   each case calls one method and compares its value.
   A compile error replaces the whole list (nothing was run). A runtime
   exception or a timeout stops the cases after it ("not run"). Rules a
   card or task adds (no temporary variable, use a foreach …) are checked
   only once the output is right, so the learner hears one thing at a time.

   THE FULL RUNTIME (units 7+, decision A). A request whose lesson runs in
   the "sandbox" (KOS.code.runnerFor) goes to .NET WebAssembly instead:
   Roslyn and the real runtime in a module worker (js/labs/cs-wasm-worker.js)
   that removes the network before any learner code runs. It is an optional
   download (frame 26g), offered once and kept per device
   (state.ui.code.runtime); the service worker keeps the files in their own
   cache, kos-csharp-<id>, across deploys. The same protocol and the same
   result shape; compiler warnings (nullable, from unit 7) ride along as
   res.warnings. The program stops itself past its step or time budget; the
   page's watchdog is the backstop, and after it fires the next run boots a
   fresh runtime.

   Pure apart from the workers: no store, no rewards. KOS.code decides what
   a pass is worth.                                                         */
(function () {
  "use strict";
  window.KOS = window.KOS || {};

  var SRC = "js/labs/cs-interp.js";
  var WATCHDOG = 4000;
  var worker = null, seq = 0, pending = {}, broken = false, loading = null;

  function canWork() {
    return !broken && typeof window.Worker === "function" && /^https?:$/.test(location.protocol);
  }
  function make() {
    try {
      var w = new window.Worker(SRC);
      w.onmessage = function (ev) {
        var p = pending[ev.data && ev.data.id];
        if (!p) return;
        clearTimeout(p.t);
        delete pending[ev.data.id];
        p.res(ev.data.res);
      };
      w.onerror = function () { broken = true; kill(); };
      return w;
    } catch (e) { broken = true; return null; }
  }
  function kill() {
    if (worker) { try { worker.terminate(); } catch (e) { /* gone */ } }
    worker = null;
  }
  /* the in-page interpreter, loaded once (file:// and the test harness) */
  function inPage() {
    if (window.CSI) return Promise.resolve(window.CSI);
    if (loading) return loading;
    loading = new Promise(function (res) {
      var s = document.createElement("script");
      s.src = SRC;
      s.onload = function () { res(window.CSI || null); };
      s.onerror = function () { res(null); };
      document.head.appendChild(s);
    });
    return loading;
  }
  function unavailable() {
    return { ok: false, stdout: "", steps: 0, ms: 0,
      error: { code: "RUNNER", kind: "internal", msg: "The in-app runner is getting ready.", line: 0 } };
  }

  /* ---------------- the full runtime ---------------- */
  var RUNTIME_ID = "csw-1.0";
  var RUNTIME_DIR = "assets/code/runtime/" + RUNTIME_ID + "/";
  var WASM_BOOT = 60000, WASM_WATCHDOG = 9000;
  var rtw = null, rtSeq = 0, rtPending = {}, rtState = null, rtInfo = { loaded: 0, total: 0, ms: 0, warm: 0, size: null, error: null }, rtListeners = [];
  function ui() { var u = KOS.store && KOS.store.state && KOS.store.state.ui; return u ? (u.code = u.code || {}) : {}; }
  function rtEmit() { rtListeners.slice().forEach(function (f) { try { f(runtime()); } catch (e) { /* a listener's problem */ } }); }
  function rtSet(st) { rtState = st; rtEmit(); }
  /* absent · offline · downloading · ready · failed (and "file" where workers cannot run) */
  function runtime() {
    var st = rtState;
    if (!st) st = !(typeof window.Worker === "function" && /^https?:$/.test(location.protocol)) ? "file"
      : ui().runtime ? (navigator.onLine === false && !rtw ? "offline" : "idle") : "absent";
    return { id: RUNTIME_ID, state: st, wanted: !!ui().runtime, loaded: rtInfo.loaded, total: rtInfo.total, ms: rtInfo.ms, warm: rtInfo.warm, size: rtInfo.size, error: rtInfo.error };
  }
  function rtKill() {
    if (rtw) { try { rtw.terminate(); } catch (e) { /* gone */ } }
    rtw = null;
    Object.keys(rtPending).forEach(function (id) { var p = rtPending[id]; clearTimeout(p.t); delete rtPending[id]; p.res(p.dead()); });
    if (rtState === "ready" || rtState === "downloading") rtState = null;
  }
  function rtMake() {
    try {
      var w = new window.Worker("js/labs/cs-wasm-worker.js?id=" + encodeURIComponent(RUNTIME_ID), { type: "module" });
      w.onmessage = function (ev) {
        var d = ev.data || {};
        if (d.type === "progress") { rtInfo.loaded = d.loaded; rtInfo.total = d.total; rtEmit(); return; }
        if (d.type === "ready") { rtInfo.ms = d.ms; rtInfo.warm = d.warm; rtInfo.error = null; rtSet("ready"); return; }
        if (d.type === "failed") { rtInfo.error = d.msg; rtSet(navigator.onLine === false ? "offline" : "failed"); return; }
        var p = rtPending[d.id];
        if (!p) return;
        clearTimeout(p.t); delete rtPending[d.id];
        p.res(d.res);
      };
      w.onerror = function (e) { rtInfo.error = (e && e.message) || "the worker stopped"; rtKill(); rtSet(navigator.onLine === false ? "offline" : "failed"); };
      return w;
    } catch (e) { rtInfo.error = String(e && e.message || e); rtSet("failed"); return null; }
  }
  /* start (or reuse) the runtime; the first start is the download */
  function rtStart() {
    if (runtime().state === "file") return false;
    ui().runtime = true;
    if (KOS.store && KOS.store.save) KOS.store.save();
    if (!rtw) { rtw = rtMake(); if (!rtw) return false; rtSet("downloading"); rtw.postMessage({}); }
    return true;
  }
  function rtRun(req) {
    var st = runtime().state;
    if (st === "absent" || st === "file") return Promise.resolve(needsRuntime(st));
    if (!rtStart()) return Promise.resolve(needsRuntime("failed"));
    var id = ++rtSeq;
    var ms = rtState === "ready" ? WASM_WATCHDOG : WASM_BOOT;
    return new Promise(function (res) {
      var dead = function () { return { ok: false, stdout: "", steps: 0, ms: ms,
        error: { code: "TIMEOUT", kind: "timeout", msg: "Stopped after " + (ms / 1000) + " seconds.", line: 0 } }; };
      var t = setTimeout(function () { var p = rtPending[id]; if (!p) return; delete rtPending[id]; rtKill(); rtEmit(); res(dead()); }, ms);
      rtPending[id] = { res: res, t: t, dead: dead };
      rtw.postMessage({ id: id, req: req });
    });
  }
  function needsRuntime(st) {
    return { ok: false, stdout: "", steps: 0, ms: 0, error: { code: st === "file" ? "RUNTIME_FILE" : "RUNTIME", kind: "runtime", line: 0,
      msg: st === "file" ? "The full C# runtime needs the app served over http(s), not opened as a file." : "This lesson runs on the full C# runtime, which is not on this device yet." } };
  }
  /* the download's size, from the runtime's own manifest */
  function rtSize() {
    if (rtInfo.size != null || !window.fetch) return Promise.resolve(rtInfo.size);
    return window.fetch(RUNTIME_DIR + "kurenai-runtime.json").then(function (r) { return r.ok ? r.json() : null; })
      .then(function (m) { rtInfo.size = m ? { bytes: m.bytes, gzip: m.gzipBytes, files: m.files.length } : null; return rtInfo.size; })
      .catch(function () { return null; });
  }
  /* remove it from this device: the worker, the cache, the wish */
  function rtRemove() {
    rtKill(); rtState = null; rtInfo.loaded = rtInfo.total = 0;
    ui().runtime = false;
    if (KOS.store && KOS.store.save) KOS.store.save();
    var done = window.caches && window.caches.keys ? window.caches.keys().then(function (ks) {
      return Promise.all(ks.filter(function (k) { return k.indexOf("kos-csharp-") === 0; }).map(function (k) { return window.caches.delete(k); }));
    }) : Promise.resolve();
    return done.then(function () { rtEmit(); });
  }
  /* an older runner's cache is never needed again */
  function rtPrune() {
    if (!window.caches || !window.caches.keys) return;
    window.caches.keys().then(function (ks) { ks.forEach(function (k) { if (k.indexOf("kos-csharp-") === 0 && k !== "kos-csharp-" + RUNTIME_ID) window.caches.delete(k); }); }).catch(function () { /* no caches */ });
  }

  /* ---------------- SQL (Spike S; T1's Databases part) ----------------
     SQLite in WebAssembly in its own sealed worker (js/labs/sql-worker.js),
     created on the first SQL run, so nothing of it is fetched before a
     lesson asks; each run is a fresh in-memory database seeded with the
     lesson's dataset (req.seed). The same watchdog as the interpreter. */
  var sqlw = null, sqlPending = {}, sqlBroken = false;
  function sqlKill() {
    if (sqlw) { try { sqlw.terminate(); } catch (e) { /* gone */ } }
    sqlw = null;
  }
  function sqlMake() {
    try {
      var w = new window.Worker("js/labs/sql-worker.js");
      w.onmessage = function (ev) {
        var p = sqlPending[ev.data && ev.data.id];
        if (!p) return;
        clearTimeout(p.t); delete sqlPending[ev.data.id];
        p.res(ev.data.res);
      };
      w.onerror = function () { sqlBroken = true; sqlKill(); };
      return w;
    } catch (e) { sqlBroken = true; return null; }
  }
  function sqlRun(req) {
    var src = req.src != null ? req.src : (req.files || []).map(function (f) { return f.src; }).join("\n");
    var fresh = !sqlw;
    if (sqlBroken || typeof window.Worker !== "function" || !/^https?:$/.test(location.protocol) || !(sqlw = sqlw || sqlMake())) {
      return Promise.resolve({ ok: false, stdout: "", steps: 0, ms: 0, error: { code: "SQL_UNAVAILABLE", kind: "runner", line: 0,
        msg: "SQL runs in a worker, which needs the app served over http(s)." } });
    }
    var id = ++seq;
    return new Promise(function (res) {
      var t = setTimeout(function () {
        sqlKill(); delete sqlPending[id];
        res({ ok: false, stdout: "", steps: 0, ms: WATCHDOG, error: { code: "TIMEOUT", kind: "timeout", msg: "Stopped after " + (WATCHDOG / 1000) + " seconds.", line: 0 } });
      }, fresh ? WATCHDOG + 4000 : WATCHDOG);  /* a new worker also loads SQLite (~700 KB) */
      sqlPending[id] = { res: res, t: t };
      sqlw.postMessage({ id: id, req: { src: src, seed: req.seed || "" } });
    }).then(function (r) {
      /* the checker's shape: SQL errors read as a runtime stop, with SQLite's words */
      if (r && r.error && r.error.kind === "sql") r.error = { code: "SQL", kind: "sql", msg: r.error.msg, line: 0 };
      return r;
    });
  }

  /* run(req) → Promise of the interpreter's result (see cs-interp.js);
     req.runner "wasm", or req.lesson in a sandbox unit, uses the full
     runtime; req.runner "sql" (or req.lang "sql") runs SQLite */
  function run(req) {
    req = Object.assign({ budget: 3e6, ms: 2500 }, req);
    var which = req.lang === "sql" ? "sql" : req.runner || (req.lesson && KOS.code && KOS.code.runnerFor ? KOS.code.runnerFor(req.lesson) : "interp");
    if (which === "sql") {
      /* the lesson's dataset unless the request brings its own */
      if (req.seed == null && KOS.code && KOS.code.datasetFor) req.seed = KOS.code.datasetFor(req.lesson, req.db);
      return sqlRun(req);
    }
    if (which === "wasm") return rtRun(Object.assign({}, req, { budget: 5e6, ms: 3000, nullable: req.nullable !== false }));
    if (canWork()) {
      if (!worker) worker = make();
      if (worker) {
        var id = ++seq;
        return new Promise(function (res) {
          var t = setTimeout(function () {
            kill();
            delete pending[id];
            res({ ok: false, stdout: "", steps: 0, ms: WATCHDOG,
              error: { code: "TIMEOUT", kind: "timeout", msg: "Stopped after " + (WATCHDOG / 1000) + " seconds.", line: 0 } });
          }, WATCHDOG);
          pending[id] = { res: res, t: t };
          worker.postMessage({ id: id, req: req });
        });
      }
    }
    return inPage().then(function (csi) { return csi ? csi.run(req) : unavailable(); });
  }
  function status() {
    if (canWork() || window.CSI) return "ready";
    return loading ? "loading" : "ready";
  }

  /* ---------------- comparing output ---------------- */
  function norm(s) {
    return String(s == null ? "" : s).replace(/\r\n?/g, "\n").split("\n")
      .map(function (l) { return l.replace(/\s+$/, ""); }).join("\n").replace(/\n+$/, "");
  }
  /* the two outputs as aligned rows, each marked when it differs */
  function diff(expected, got) {
    var e = norm(expected).split("\n"), g = norm(got).split("\n");
    var n = Math.max(e.length, g.length), rows = [];
    for (var i = 0; i < n; i++) rows.push({ exp: e[i], got: g[i], same: e[i] === g[i] });
    return rows;
  }
  /* a predicted answer against what ran: the whole output, or — for SQL,
     whose output is tables — just the values, each row's cells on a line
     (the header and the rule under it left out) */
  function sqlValues(s) {
    var lines = norm(s).split("\n"), out = [];
    for (var i = 0; i < lines.length; i++) {
      if (/^-+(-\+-+)*$/.test(lines[i]) && i > 0) { out.pop(); continue; }
      if (lines[i] === "" || lines[i] === "(no rows)") continue;
      out.push(lines[i].split(" | ").map(function (c) { return c.trim(); }).join(" "));
    }
    return out.join("\n");
  }
  function sameAnswer(typed, stdout, lang) {
    var a = norm(typed), real = norm(stdout);
    if (a === real) return true;
    if (lang !== "sql") return false;
    var vals = function (t) { return t.split("\n").map(function (l) { return l.split(/\s*[|,]\s*|\s+/).filter(Boolean).join(" "); }).filter(Boolean).join("\n"); };
    return vals(a) === vals(sqlValues(real));
  }
  function firstLine(s) { var t = String(s == null ? "" : s); var i = t.indexOf("\n"); return i < 0 ? t : t.slice(0, i) + "…"; }

  /* check(spec, files) → Promise of
       { compile: error|null, results: [case], pass, total, stopped, rule }
     spec: { mode, method, cases: [{stdin, out, args, hidden}], rules } */
  function check(spec, files) {
    /* a case with no written output (an SQL card's variation) expects what
       the item's own answer prints on the same data: run that first */
    if (spec.answer && (spec.cases || []).some(function (c) { return c.out == null; })) {
      return Promise.all(spec.cases.map(function (c) {
        if (c.out != null) return c;
        return run({ files: [{ name: "answer", src: spec.answer }], stdin: c.stdin || "", fs: c.fs || spec.fs, seed: c.seed || spec.seed, db: c.db || spec.db, lang: spec.lang, lesson: spec.lesson, runner: spec.runner })
          .then(function (r) { return Object.assign({}, c, { out: r.ok ? r.stdout : "(the answer did not run)" }); });
      })).then(function (cs) { return check(Object.assign({}, spec, { cases: cs, answer: null }), files); });
    }
    var cases = spec.cases || [];
    var results = [];
    var out = { compile: null, results: results, pass: 0, total: cases.length, stopped: null, rule: null, ms: 0 };
    function one(i) {
      if (i >= cases.length) return Promise.resolve(out);
      var c = cases[i];
      var req = spec.mode === "method"
        ? { files: files, mode: "method", call: { name: spec.method, args: c.args || [] }, stdin: c.stdin || "", fs: c.fs || spec.fs, lesson: spec.lesson, runner: spec.runner }
        : { files: files, stdin: c.stdin || "", fs: c.fs || spec.fs, seed: c.seed || spec.seed, db: c.db || spec.db, lang: spec.lang, lesson: spec.lesson, runner: spec.runner };
      return run(req).then(function (r) {
        out.ms += r.ms || 0;
        if (!r.ok && r.error && (r.error.kind === "compile" || r.error.kind === "unsupported" || r.error.kind === "runtime")) {
          out.compile = r.error;
          results.length = 0;
          out.pass = 0;
          return out;
        }
        var got = spec.mode === "method" ? r.value : r.stdout;
        var row = { i: i, hidden: !!c.hidden, input: c.stdin != null ? c.stdin : c.args ? JSON.stringify(c.args) : "",
          expected: c.out, got: got, ms: r.ms || 0, ok: false, error: null };
        if (!r.ok) {
          row.error = r.error;
          results.push(row);
          out.stopped = { at: i, error: r.error };
          for (var k = i + 1; k < cases.length; k++) results.push({ i: k, hidden: !!cases[k].hidden, skipped: true });
          return out;
        }
        row.ok = norm(got) === norm(c.out);
        if (row.ok) out.pass++;
        results.push(row);
        return one(i + 1);
      });
    }
    return one(0).then(function () {
      /* rules speak only once every case passes */
      if (!out.compile && !out.stopped && out.pass === out.total && spec.rules && spec.rules.length) {
        var src = files.map(function (f) { return f.src; }).join("\n");
        for (var j = 0; j < spec.rules.length; j++) {
          var rule = spec.rules[j];
          var ok = true;
          try { ok = rule.test(src); } catch (e) { ok = true; }
          if (!ok) { out.rule = { id: rule.id || String(j), msg: rule.msg }; break; }
        }
      }
      out.passed = !out.compile && !out.stopped && out.pass === out.total && !out.rule;
      return out;
    });
  }

  /* the error card's words: the raw message, one plain sentence and what
     usually causes it (frame 26f2), from the decoder in data/code.js */
  function explain(err) {
    if (!err) return null;
    var E = (window.KOS_CODE && window.KOS_CODE.ERRORS) || {};
    var d = E[err.code] || E[err.type] || null;
    var kind = err.kind === "compile" ? "Compile error"
      : err.kind === "exception" ? "Runtime exception"
      : err.kind === "timeout" ? "Did not finish"
      : err.kind === "unsupported" ? "Beyond the in-app runner"
      : err.kind === "runtime" ? "Needs the full C# runtime"
      : err.kind === "sql" ? "SQLite error" : "Runner problem";
    return { kind: kind, code: err.code, line: err.line || 0, msg: err.msg,
      plain: d ? d.plain : null, usually: d ? d.usually : null };
  }

  KOS.codeRun = {
    run: run, sameAnswer: sameAnswer, sqlValues: sqlValues,
    check: check,
    norm: norm,
    diff: diff,
    explain: explain,
    firstLine: firstLine,
    status: status,
    RUNTIME_ID: RUNTIME_ID,
    runtime: runtime,
    startRuntime: rtStart,
    runtimeSize: rtSize,
    removeRuntime: rtRemove,
    pruneRuntimes: rtPrune,
    onRuntime: function (f) { rtListeners.push(f); return function () { rtListeners = rtListeners.filter(function (g) { return g !== f; }); }; },
    /* tests: forget the workers so the next run starts fresh ones */
    _reset: function () { kill(); broken = false; loading = null; rtKill(); rtState = null; sqlKill(); sqlBroken = false; }
  };
})();
