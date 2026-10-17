// Spike T: how well each tokeniser hands back the dictionary forms that lookup and subtitle
// coverage need, on lines.js — plus load time, memory and speed.
// Run: node prototypes/japanese-space/spike-t/run.mjs <node_modules dir with the candidates> [--merge <JMdict headwords.txt>]
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { performance } from "node:perf_hooks";
const DEPS = process.argv[2], MERGE = process.argv.indexOf("--merge") > 0 ? process.argv[process.argv.indexOf("--merge") + 1] : null;
const here = createRequire(import.meta.url), dep = createRequire(DEPS + "/x.js");
const LINES = here("./lines.js");
const headwords = MERGE ? new Set(readFileSync(MERGE, "utf8").split("\n")) : null;

// sections from the "// ---- name" markers in lines.js
const src = readFileSync(new URL("./lines.js", import.meta.url), "utf8").split("\n");
const sections = []; let cur = "?";
for (const l of src) { const m = /\/\/ ---- (.+?) ----/.exec(l); if (m) cur = m[1]; else if (/^\s*\["/.test(l)) sections.push(cur); }

const hira = s => String(s || "").replace(/[ァ-ヶ]/g, c => String.fromCharCode(c.charCodeAt(0) - 0x60));
const mb = () => process.memoryUsage().rss / 1048576;

async function lindera(dic) {
  const m = await import(DEPS + `/lindera-wasm-${dic}/lindera_wasm_${dic}.js`);
  await m.default({ module_or_path: readFileSync(DEPS + `/lindera-wasm-${dic}/lindera_wasm_${dic}_bg.wasm`) });
  const b = new m.TokenizerBuilder(); b.set_dictionary("embedded://" + dic); b.set_mode("normal"); const t = b.build();
  return text => t.tokenize(text).map(x => {
    const d = x.details;
    return { s: x.surface, pos: d[0], c: dic === "unidic" ? [d[7], d[10], hira(d[6]), x.surface] : [d[6], x.surface] };
  });
}
async function sudachi() {
  const s = await import(DEPS + "/sudachi-wasm333/sudachi.js"), st = new s.SudachiStateful();
  await st.initialize_node(p => readFileSync(p), s.TokenizeMode.C, false, DEPS + "/sudachi-wasm333/resources/system.dic");
  return text => st.tokenize_raw(text).map(x => ({ s: x.surface, pos: x.poses[0], c: [x.dictionary_form, x.normalized_form, x.surface] }));
}
function kuromoji() {
  return new Promise((res, rej) => dep("kuromoji").builder({ dicPath: DEPS + "/kuromoji/dict" }).build((e, tk) => e ? rej(e) : res(text => tk.tokenize(text).map(x => ({ s: x.surface_form, pos: x.pos, c: [x.basic_form, x.surface_form] })))));
}

const CANDS = [["kuromoji (IPADIC)", kuromoji, "41 MB package, 17 MB dict"], ["lindera IPADIC", () => lindera("ipadic"), "18 MB (dict in the wasm)"], ["lindera UniDic", () => lindera("unidic"), "52 MB (dict in the wasm)"], ["Sudachi (core)", sudachi, "131 MB"]];
const results = [];
for (const [name, make, size] of CANDS) {
  const m0 = mb(), t0 = performance.now();
  let tok = await make();
  const load = performance.now() - t0, mem = mb() - m0;
  if (headwords) tok = here("./merge.js").wrap(tok, headwords);
  let hit = 0, total = 0; const bySec = {}, misses = [];
  LINES.forEach(([line, exp], i) => {
    const toks = tok(line), cands = new Set();
    toks.forEach(t => t.c.forEach(c => { if (c && c !== "*") { cands.add(c); cands.add(hira(c)); } }));
    exp.split(" ").forEach(e => {
      const [w, r] = e.split(":"), ok = cands.has(w) || cands.has(r);
      total++; if (ok) hit++;
      const sec = sections[i]; bySec[sec] = bySec[sec] || [0, 0]; bySec[sec][1]++; if (ok) bySec[sec][0]++;
      if (!ok) misses.push(w + " in 「" + line + "」 → " + toks.map(t => t.s).join("|"));
    });
  });
  const t1 = performance.now(); let n = 0;
  for (let k = 0; k < 20; k++) LINES.forEach(([line]) => { n += tok(line).length; });
  const speed = (20 * LINES.length) / ((performance.now() - t1) / 1000);
  results.push({ name, size, load: Math.round(load), mem: Math.round(mem), recall: hit / total, hit, total, bySec, misses, speed: Math.round(speed) });
}
console.log("\nlines " + LINES.length + " · expected forms " + results[0].total + (MERGE ? " · WITH the JMdict merge" : ""));
console.table(results.map(r => ({ tokeniser: r.name, recall: (r.recall * 100).toFixed(1) + "%", found: r.hit + "/" + r.total, "load ms": r.load, "RSS MB": r.mem, "lines/s": r.speed, size: r.size })));
const secs = Object.keys(results[0].bySec);
console.table(secs.map(s => Object.fromEntries([["section", s]].concat(results.map(r => [r.name, r.bySec[s][0] + "/" + r.bySec[s][1]])))));
for (const r of results) { console.log("\n" + r.name + " misses (" + r.misses.length + "):"); r.misses.slice(0, 40).forEach(m => console.log("  " + m)); }
