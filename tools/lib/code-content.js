/* tools/lib/code-content.js — load the Code curriculum in Node, outside the
   browser, for the smoke suites and tools/cs_diff.mjs.

     const { K, content, CSI } = loadCode();
     K        window.KOS_CODE (concepts, tasks, cards, stages …)
     content  { "code:1.1": {...}, … }
     CSI      the in-app interpreter (js/labs/cs-interp.js)
     programs(K, content)  every program the content ships, as
       { where, src, stdin, expect?, kind } — listings, practice items,
       task answers against every case, and retrieval answers for 20 seeds */
"use strict";
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const ROOT = path.join(__dirname, "..", "..");

function loadCode() {
  const sandbox = { window: { KOS_CONTENT: {}, KOS_DATA: {} }, console };
  sandbox.window.window = sandbox.window;
  vm.createContext(sandbox);
  const files = ["js/data/code.js"].concat(
    fs.readdirSync(path.join(ROOT, "js/data/content")).filter((f) => /^code-(u\d+|c\d+|ub|t\d+[a-z]*|t\d+-data|projects-files)\.js$/.test(f)).sort().map((f) => "js/data/content/" + f));
  for (const f of files) vm.runInContext("(function(window){" + fs.readFileSync(path.join(ROOT, f), "utf8") + "\n})(window);", sandbox, { filename: f });
  const CSI = require(path.join(ROOT, "js/labs/cs-interp.js"));
  return { K: sandbox.window.KOS_CODE, content: sandbox.window.KOS_CONTENT, data: sandbox.window.KOS_DATA.code, CSI, files };
}

function hash(s) { let x = 2166136261; s = String(s); for (let i = 0; i < s.length; i++) { x ^= s.charCodeAt(i); x = Math.imul(x, 16777619); } return x >>> 0; }
function rng(seed) { let st = seed || 1; return (k) => { st ^= st << 13; st >>>= 0; st ^= st >>> 17; st ^= st << 5; st >>>= 0; return k ? st % k : st / 4294967296; }; }
function variation(card, n) { return Object.assign({ n }, card.vary(rng(hash(card.id + ":" + n) || 7), n)); }

function listings(blocks, out) {
  (blocks || []).forEach((b) => {
    if (!b || typeof b !== "object") return;
    if (b.run) out.push(b.run);
    if (b.callout && Array.isArray(b.callout.body)) listings(b.callout.body, out);
  });
  return out;
}

/* which runner a program's lesson uses: "wasm" for the sandbox units (7–9,
   11, 12) and their capstone, "sql" for an SQL part (T1A), the interpreter
   otherwise (KOS.code.runnerFor) */
function runnerOf(K, data, lesson) {
  const u = (data.sections || []).find((sec) => (sec.children || []).some((l) => l.ref === lesson));
  const where = u ? u.where : K.CAPSTONES[lesson] ? K.CAPSTONES[lesson].where : null;
  return where === "sandbox" ? "wasm" : where === "sql" ? "sql" : "interp";
}

function programs(K, content) {
  const out = [];
  Object.keys(content).filter((k) => k.indexOf("code:") === 0).forEach((key) => {
    const c = content[key];
    const lesson = key.slice(5);
    listings(c.notes, []).forEach((r) => out.push({ where: key + " listing " + r.id, src: r.src, stdin: r.stdin || "", fs: r.fs, db: r.db, kind: "listing", lesson }));
    const p = c.practice || {};
    (p.predict || []).forEach((it) => out.push({ where: key + " predict " + it.id, src: it.src, stdin: it.stdin || "", fs: it.fs, db: it.db, kind: "predict", lesson }));
    (p.bug || []).forEach((it) => out.push({ where: key + " bug " + it.id + " (broken)", src: it.src, stdin: it.stdin || "", fs: it.fs, db: it.db, kind: "bug-broken", expectNot: it.out, lesson }));
  });
  Object.keys(K.TASKS).forEach((id) => {
    const t = K.TASKS[id];
    (t.examples || []).concat(t.hidden || []).forEach((c, i) => out.push({ where: "task " + id + " case " + (i + 1), src: t.answer, stdin: c.stdin || "", fs: c.fs || t.fs, db: c.db || t.db, expect: c.out, kind: "answer", lesson: t.lesson }));
  });
  Object.keys(K.CAPSTONES).forEach((id) => {
    const cp = K.CAPSTONES[id];
    if (!cp.answer) return;
    (cp.milestones || []).forEach((m) => m.cases.forEach((c, i) => out.push({ where: "capstone " + id + " " + m.id + " case " + (i + 1), src: cp.answer, stdin: c.stdin || "", fs: c.fs || cp.fs, expect: c.out, kind: "capstone", lesson: id })));
  });
  Object.keys(K.CARDS).forEach((id) => {
    const cd = K.CARDS[id];
    for (let n = 1; n <= 20; n++) {
      const v = variation(cd, n);
      if (v.kind === "predict") out.push({ where: "card " + id + " v" + n, src: v.src, stdin: v.stdin || "", fs: v.fs, db: v.db, kind: "card-predict", lesson: cd.lesson });
      else if (v.answer) (v.cases || []).forEach((c, i) => out.push({ where: "card " + id + " v" + n + " case " + (i + 1), src: v.answer, stdin: c.stdin || "", fs: c.fs || v.fs, db: c.db || v.db, expect: c.out, kind: "card-answer", lesson: cd.lesson }));
    }
  });
  return out;
}

/* an SQL program's seed: its own db, else its part's (KOS.code.datasetFor) */
function seedOf(K, data, p) {
  const u = (data.sections || []).find((sec) => (sec.children || []).some((l) => l.ref === p.lesson));
  const name = p.db || (u && u.db);
  return name && K.DATASETS && K.DATASETS[name] != null ? K.DATASETS[name] : "";
}
/* every SQL program the content ships, seeded, for tools/sql_diff.mjs */
function sqlPrograms() {
  const { K, content, data } = loadCode();
  return programs(K, content).filter((p) => runnerOf(K, data, p.lesson) === "sql")
    .map((p) => Object.assign(p, { seed: seedOf(K, data, p) }));
}

module.exports = { loadCode, programs, sqlPrograms, seedOf, variation, listings, runnerOf, ROOT };
