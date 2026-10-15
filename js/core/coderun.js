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

   Pure apart from the worker: no store, no rewards. KOS.code decides what
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

  /* run(req) → Promise of the interpreter's result (see cs-interp.js) */
  function run(req) {
    req = Object.assign({ budget: 3e6, ms: 2500 }, req);
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
  function firstLine(s) { var t = String(s == null ? "" : s); var i = t.indexOf("\n"); return i < 0 ? t : t.slice(0, i) + "…"; }

  /* check(spec, files) → Promise of
       { compile: error|null, results: [case], pass, total, stopped, rule }
     spec: { mode, method, cases: [{stdin, out, args, hidden}], rules } */
  function check(spec, files) {
    var cases = spec.cases || [];
    var results = [];
    var out = { compile: null, results: results, pass: 0, total: cases.length, stopped: null, rule: null, ms: 0 };
    function one(i) {
      if (i >= cases.length) return Promise.resolve(out);
      var c = cases[i];
      var req = spec.mode === "method"
        ? { files: files, mode: "method", call: { name: spec.method, args: c.args || [] }, stdin: c.stdin || "" }
        : { files: files, stdin: c.stdin || "" };
      return run(req).then(function (r) {
        out.ms += r.ms || 0;
        if (!r.ok && r.error && (r.error.kind === "compile" || r.error.kind === "unsupported")) {
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
      : err.kind === "unsupported" ? "Beyond the in-app runner" : "Runner problem";
    return { kind: kind, code: err.code, line: err.line || 0, msg: err.msg,
      plain: d ? d.plain : null, usually: d ? d.usually : null };
  }

  KOS.codeRun = {
    run: run,
    check: check,
    norm: norm,
    diff: diff,
    explain: explain,
    firstLine: firstLine,
    status: status,
    /* tests: forget the worker so the next run starts a fresh one */
    _reset: function () { kill(); broken = false; loading = null; }
  };
})();
