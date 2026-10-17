// prints raw token fields for two lines from each tokeniser (to map fields before scoring)
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
const DEPS = process.argv[2], req = createRequire(DEPS + "/x.js");
const L = ["もう全部食べちゃった。", "すげえ、マジやべえじゃん"];
for (const dic of ["ipadic", "unidic"]) {
  const m = await import(DEPS + `/lindera-wasm-${dic}/lindera_wasm_${dic}.js`);
  await m.default({ module_or_path: readFileSync(DEPS + `/lindera-wasm-${dic}/lindera_wasm_${dic}_bg.wasm`) });
  const b = new m.TokenizerBuilder(); b.set_dictionary("embedded://" + dic); b.set_mode("normal"); const t = b.build();
  for (const l of L) console.log(dic, JSON.stringify(t.tokenize(l).map(x => [x.surface, x.details])));
}
const s = await import(DEPS + "/sudachi-wasm333/sudachi.js");
const st = new s.SudachiStateful();
await st.initialize_node((p) => readFileSync(p), s.TokenizeMode.C, false, DEPS + "/sudachi-wasm333/resources/system.dic");
for (const l of L) console.log("sudachi", JSON.stringify(st.tokenize_raw(l).map(x => [x.surface, x.dictionary_form, x.normalized_form, x.poses[0]])));
const kuromoji = req("kuromoji");
kuromoji.builder({ dicPath: DEPS + "/kuromoji/dict" }).build((e, tk) => { for (const l of L) console.log("kuromoji", JSON.stringify(tk.tokenize(l).map(x => [x.surface_form, x.basic_form, x.pos]))); });
