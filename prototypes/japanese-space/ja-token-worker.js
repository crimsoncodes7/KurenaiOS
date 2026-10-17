// Spike T in the browser: Lindera + UniDic in a module worker, with the JMdict merge on top
// (plan §7.2 "The tokeniser": worker only, started on first use; the page never blocks on it).
import init, { TokenizerBuilder } from "./vendor/lindera-unidic/lindera_wasm_unidic.js";

let tok = null, heads = null, wasm = null;
const hira = s => String(s || "").replace(/[ァ-ヶ]/g, c => String.fromCharCode(c.charCodeAt(0) - 0x60));

function tokenize(text) {
  const t = tok.tokenize(text).map(x => {
    const d = x.details;
    return { s: x.surface, pos: d[0], lemma: d[7], base: d[10] || d[7], reading: hira(d[6]), pron: d[9] };
  });
  const merged = [];
  for (let i = 0; i < t.length; i++) {
    let head = "";
    for (let j = i + 1; j < Math.min(t.length, i + 5); j++) {
      head += t[j - 1].s;
      for (const f of [t[j].s, t[j].base]) {
        const w = head + f;
        // only joins that hold a content character: keeps ました / のに-style joins out of coverage
        if (f && heads.has(w) && /[㐀-鿿ァ-ヺ]/.test(w)) { merged.push({ s: w, from: i, to: j + 1, pos: "merged" }); break; }
      }
    }
  }
  return { tokens: t, merged };
}

self.onmessage = async (e) => {
  const m = e.data;
  if (m.type === "load") {
    const t0 = performance.now();
    try {
      wasm = await init();
      const b = new TokenizerBuilder(); b.set_dictionary("embedded://unidic"); b.set_mode("normal"); tok = b.build();
      const t1 = performance.now();
      heads = new Set((await (await fetch("vendor/jmdict-headwords.txt")).text()).split("\n"));
      self.postMessage({ type: "ready", tokenizerMs: Math.round(t1 - t0), totalMs: Math.round(performance.now() - t0),
        wasmMB: Math.round((wasm && wasm.memory ? wasm.memory.buffer.byteLength : 0) / 1048576), headwords: heads.size });
    } catch (err) { self.postMessage({ type: "error", message: String(err && err.message || err) }); }
    return;
  }
  if (m.type === "tokenize") {
    const t0 = performance.now();
    const out = m.lines.map(tokenize);
    self.postMessage({ type: "result", id: m.id, out, ms: performance.now() - t0 });
  }
};
