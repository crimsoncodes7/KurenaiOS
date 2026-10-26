/* Kurenai OS — core/codeproj.js
   Code's Rider projects, the device side (docs/code-plan.md §9; frames
   26m–26o): the scaffold that is exported, and the report that comes back.

   EXPORT. files(id) is the scaffold exactly as the validator expects it:
   the project's files, the validator (assets/code/validator/validate.cs)
   and kurenai.project.json, whose "protected" map holds the SHA-256 of
   every protected file (text with \n line endings, as the validator hashes
   it). zip(id) packs them under the project's folder name — made on the
   device, nothing sent anywhere.

   IMPORT. check(text) is pure and runs the plan's order (§9.4): size and
   shape (256 KB, JSON, the schema, strict types; unknown fields dropped) →
   identity (one of these projects, a known scaffold version, a validator
   new enough) → protected files (against THIS app's own hashes, not the
   project file's) → sane time → idempotence (the file's SHA-256). It
   returns the outcome and a preview; nothing changes until apply(), which
   goes through KOS.code.recordReport — the only gate to evidence.       */
(function () {
  "use strict";
  window.KOS = window.KOS || {};
  var MAX = 256 * 1024;
  /* earlier validators' own hashes: a project exported before a validator
     release still reports with the one it shipped, and is accepted while
     that version meets the project's minValidator */
  var EARLIER = { "1.0.0": "b9dc809ca8e5e6008e3b82ff371468f3e7f0946b59fa63156a8b164a5e5f12e0", "1.1.0": "25ad35f2ac0d4af121db09c99dfbaff23f475d7c9ffad4af8953facb886bb4e4" };
  var validatorText = null;
  function C() { return KOS.code; }
  function Z() { return KOS.codeZip; }
  function spec(id) { return C().project(id); }

  /* the validator's source, fetched once (precached by the service worker) */
  function validator() {
    if (validatorText != null) return Promise.resolve(validatorText);
    return window.fetch("assets/code/validator/validate.cs").then(function (r) {
      if (!r.ok) throw new Error("the validator could not be read (" + r.status + ")");
      return r.text();
    }).then(function (t) { validatorText = t; return t; });
  }
  function versionOf(v) { var m = /Kurenai validator (\d+\.\d+\.\d+)/.exec(v || ""); return m ? m[1] : null; }
  /* the files, keyed by path, without kurenai.project.json */
  function rawFiles(p, v) {
    var f = Object.assign({}, p.files);
    f[".kurenai/validate.cs"] = v;
    return f;
  }
  function manifest(p, v) {
    var files = rawFiles(p, v), prot = {};
    p.protected.forEach(function (path) { prot[path] = Z().sha256(files[path] || ""); });
    return {
      schema: "kurenai.project/1", id: p.id, title: p.title, scaffoldVersion: p.scaffoldVersion, validator: versionOf(v),
      solution: p.solution, protected: prot,
      milestones: p.milestones.map(function (m) { return { id: m.id, title: m.title, checks: m.checks }; })
    };
  }
  function files(id) {
    var p = spec(id);
    if (!p) return Promise.reject(new Error("no such project"));
    return validator().then(function (v) {
      var f = rawFiles(p, v);
      f["kurenai.project.json"] = JSON.stringify(manifest(p, v), null, 1) + "\n";
      return f;
    });
  }
  function zip(id) {
    var p = spec(id);
    return files(id).then(function (f) {
      var list = Object.keys(f).sort().map(function (path) { return { path: p.folder + "/" + path, text: f[path] }; });
      return { name: p.folder + ".zip", bytes: Z().make(list), files: Object.keys(f).sort() };
    });
  }
  /* save the zip through the browser's own download */
  function download(id) {
    return zip(id).then(function (z) {
      C().noteExport(id);
      var url = URL.createObjectURL(new window.Blob([z.bytes], { type: "application/zip" }));
      var a = document.createElement("a");
      a.href = url; a.download = z.name; document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
      return z;
    });
  }

  /* ---------------- the report ---------------- */
  var isStr = function (x) { return typeof x === "string"; };
  var isObj = function (x) { return x && typeof x === "object" && !Array.isArray(x); };
  var vcmp = function (a, b) { a = String(a).split(".").map(Number); b = String(b).split(".").map(Number); for (var i = 0; i < 3; i++) { if ((a[i] || 0) !== (b[i] || 0)) return (a[i] || 0) - (b[i] || 0); } return 0; };
  function reject(code, msg) { return { outcome: "rejected", code: code, msg: msg }; }
  /* strict shape; anything unexpected rejects, unknown fields are dropped */
  function shape(j) {
    if (!isObj(j) || j.schema !== "kurenai.validation/1") return null;
    if (!isObj(j.project) || !isStr(j.project.id) || typeof j.project.scaffoldVersion !== "number") return null;
    if (!isObj(j.validator) || !isStr(j.validator.version) || !/^\d+\.\d+\.\d+$/.test(j.validator.version)) return null;
    if (!Array.isArray(j.steps) || !Array.isArray(j.milestones) || !isObj(j.protected) || typeof j.protected.ok !== "boolean") return null;
    if (!isStr(j.startedAt) || !isStr(j.finishedAt) || isNaN(Date.parse(j.startedAt)) || isNaN(Date.parse(j.finishedAt))) return null;
    if (!j.milestones.every(function (m) { return isObj(m) && isStr(m.id) && typeof m.ok === "boolean" && Array.isArray(m.checks || []); })) return null;
    if (!j.steps.every(function (s) { return isObj(s) && isStr(s.id) && typeof s.ran === "boolean"; })) return null;
    var files = isObj(j.protected.files) ? j.protected.files : {};
    return {
      schema: j.schema, project: { id: j.project.id.slice(0, 80), scaffoldVersion: j.project.scaffoldVersion | 0 },
      validator: { version: j.validator.version },
      env: isObj(j.env) ? { sdk: String(j.env.sdk || "").slice(0, 40), os: String(j.env.os || "").slice(0, 80), arch: String(j.env.arch || "").slice(0, 20) } : {},
      source: isObj(j.source) ? { treeSha256: String(j.source.treeSha256 || "").slice(0, 64), gitCommit: isStr(j.source.gitCommit) ? j.source.gitCommit.slice(0, 64) : null, dirty: !!j.source.dirty } : {},
      protected: { ok: j.protected.ok, files: Object.keys(files).slice(0, 50).reduce(function (o, k) { if (isStr(files[k])) o[k.slice(0, 200)] = files[k].slice(0, 80); return o; }, {}) },
      steps: j.steps.slice(0, 12).map(function (s) { return { id: s.id.slice(0, 20), ran: s.ran, exit: s.exit == null ? null : s.exit | 0, ms: s.ms | 0, errors: s.errors | 0, warnings: s.warnings | 0, passed: s.passed | 0, failed: s.failed | 0, skipped: s.skipped | 0 }; }),
      milestones: j.milestones.slice(0, 20).map(function (m) { return { id: m.id.slice(0, 20), ok: m.ok, checks: (m.checks || []).slice(0, 12).filter(isObj).map(function (c) { return { type: String(c.type || "").slice(0, 20), ok: !!c.ok, note: String(c.note || "").slice(0, 200) }; }) }; }),
      failures: (Array.isArray(j.failures) ? j.failures : []).slice(0, 10).filter(isObj).map(function (f) { return { test: f.test ? String(f.test).slice(0, 200) : undefined, build: f.build ? String(f.build).slice(0, 40) : undefined, run: f.run ? String(f.run).slice(0, 20) : undefined, message: String(f.message || "").slice(0, 300) }; }),
      startedAt: j.startedAt, finishedAt: j.finishedAt
    };
  }
  /* check(text[, {now, expectId}]) → Promise of { outcome, … } — never writes */
  function check(text, o) {
    o = o || {};
    var now = o.now || Date.now();
    if (typeof text !== "string" || text.length > MAX) return Promise.resolve(reject("size", "The file is larger than a validation report can be (256 KB)."));
    var j;
    try { j = JSON.parse(text); } catch (e) { return Promise.resolve(reject("json", "The file could not be read as a validation report.")); }
    var rep = shape(j);
    if (!rep) return Promise.resolve(reject("shape", "The file could not be read as a validation report."));
    var p = spec(rep.project.id);
    if (!p || (o.expectId && o.expectId !== p.id)) return Promise.resolve(reject("project", "The project id in the report does not match " + (o.expectId ? "this project" : "any project here") + "."));
    if (rep.project.scaffoldVersion > p.scaffoldVersion || rep.project.scaffoldVersion < 1) return Promise.resolve(reject("scaffold", "Scaffold v" + rep.project.scaffoldVersion + " is newer than this app. Update the app, then try again."));
    if (vcmp(rep.validator.version, p.minValidator) < 0) return Promise.resolve(reject("validator", "Validator " + rep.validator.version + " is no longer accepted. Export the project again to get " + p.minValidator + "."));
    var fin = Date.parse(rep.finishedAt);
    if (fin > now + 10 * 60000 || Date.parse(rep.startedAt) > fin) return Promise.resolve(reject("future", "The report is dated " + new Date(fin).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" }) + ". Check the clock on the machine that ran it."));
    var view = C().projectView(p.id);
    if (view.exportedAt && fin < view.exportedAt - 86400000) return Promise.resolve(reject("before", "The report is older than this project's export on this device."));
    var sha = Z().sha256(text);
    var had = view.reports.filter(function (e) { return e.sha === sha; })[0];
    if (had) return Promise.resolve({ outcome: "duplicate", sha: sha, at: had.importedAt, msg: "This report was brought in on " + new Date(had.importedAt).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" }) + ". Nothing changed." });
    return validator().then(function (v) {
      var want = manifest(p, v).protected;
      var vv = rep.validator.version;
      if (want[".kurenai/validate.cs"] && vv !== versionOf(v) && EARLIER[vv]) want[".kurenai/validate.cs"] = EARLIER[vv];
      var mismatched = Object.keys(want).filter(function (k) { return rep.protected.files[k] !== want[k]; });
      var practice = !rep.protected.ok || mismatched.length > 0;
      var passed = view.milestones.reduce(function (o2, m) { o2[m.id] = !!m.passedAt; return o2; }, {});
      var changes = p.milestones.map(function (m) {
        var got = rep.milestones.filter(function (x) { return x.id === m.id; })[0];
        var failing = got ? got.checks.filter(function (c) { return !c.ok; }) : [];
        return { id: m.id, title: m.title, was: passed[m.id], now: !!(got && got.ok), becomes: !practice && !passed[m.id] && !!(got && got.ok), why: !got ? "not in this report" : failing.length ? failing[0].note : "" };
      });
      var completes = !practice && !view.payAt && !!p.reward && p.milestones.every(function (m, i) { return passed[m.id] || changes[i].becomes; });
      return { outcome: practice ? "practice" : "accepted", sha: sha, report: rep, project: p, practice: practice, mismatched: mismatched,
        changes: changes, completes: completes, reward: completes ? C().award({ kind: "project", id: p.id, first: true }) : null };
    });
  }
  /* apply(res, {level}) — "ci" only for a report read back from a check
     run on GitHub (KOS.codeGit.ciReport), which already lives there */
  function apply(res, o) {
    if (!res || (res.outcome !== "accepted" && res.outcome !== "practice")) return null;
    var ci = !!(o && o.level === "ci");
    var out = C().recordReport(res.project.id, res.report, { sha: res.sha, practice: res.practice, mismatched: res.mismatched, level: ci ? "ci" : "self" });
    /* the report joins the next GitHub push when it is connected */
    if (!res.practice && !ci && KOS.codeGit) KOS.codeGit.queueReport(res.project.id, res.sha, JSON.stringify(res.report, null, 2));
    return out;
  }

  KOS.codeProject = {
    files: files, zip: zip, download: download, manifest: manifest, check: check, apply: apply, shape: shape,
    validatorVersion: versionOf,
    /* tests: hand in the validator's source instead of fetching it */
    _setValidator: function (t) { validatorText = t; }
  };
})();
