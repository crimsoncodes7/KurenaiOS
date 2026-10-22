// Golden tests for Japanese: kana conversion, the conjugation engine, every validator strategy and
// the stroke checker on every kana (docs/japanese-plan.md §7, invariant 114). A new exercise ships
// only when its expected answers pass here. Run: node tools/ja_valid_check.mjs
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
for (const f of ["../js/core/jakana.js", "../js/core/jaconj.js", "../js/core/javalid.js", "../js/data/ja-strokes.js", "../js/core/jastroke.js"]) require(f);
const K = globalThis.KOS;
const JA = { kana: K.jaKana, conj: K.jaConj, verbs: K.jaVerbs, valid: K.jaValid, stroke: K.jaStroke, strokes: K.jaStrokes };

let pass = 0, fail = 0;
function eq(name, got, want) {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  ok ? pass++ : fail++;
  if (!ok) console.log("✗ " + name + "\n    got  " + JSON.stringify(got) + "\n    want " + JSON.stringify(want));
}
const V = (strategy, input, ex) => JA.valid.check(strategy, input, ex);
const verb = d => JA.verbs.find(v => v.dict === d);

// ---------- romaji → kana ----------
for (const [r, k] of [["konnichiwa", "こんにちわ"], ["kitte", "きって"], ["gakkou", "がっこう"], ["shinbun", "しんぶん"],
  ["kon'ya", "こんや"], ["honn", "ほん"], ["kyou", "きょう"], ["jinja", "じんじゃ"], ["tsukue", "つくえ"], ["obaasan", "おばあさん"],
  ["SUSHI", "スシ"], ["ra-men", "らーめん"], ["chotto", "ちょっと"]])
  eq("toKana " + r, JA.kana.toKana(r), k);
eq("morae", JA.kana.morae("きょうはっ"), ["きょ", "う", "は", "っ"]);

// ---------- conjugation engine: every class and godan ending ----------
const table = {
  "食べる": { masu: "食べます", te: "食べて", ta: "食べた", nai: "食べない", nakatta: "食べなかった", masendeshita: "食べませんでした", tai: "食べたい", mashou: "食べましょう" },
  "飲む": { masu: "飲みます", te: "飲んで", ta: "飲んだ", nai: "飲まない" },
  "書く": { te: "書いて", ta: "書いた", nai: "書かない" },
  "泳ぐ": { te: "泳いで", ta: "泳いだ" },
  "話す": { te: "話して", masu: "話します", nai: "話さない" },
  "待つ": { te: "待って", nai: "待たない", masu: "待ちます" },
  "死ぬ": { te: "死んで", ta: "死んだ" },
  "遊ぶ": { te: "遊んで", nai: "遊ばない" },
  "買う": { te: "買って", nai: "買わない", nakatta: "買わなかった" },
  "帰る": { masu: "帰ります", te: "帰って", nai: "帰らない" },
  "行く": { te: "行って", ta: "行った", masu: "行きます", nai: "行かない" },
  "ある": { nai: "ない", nakatta: "なかった", masu: "あります", te: "あって" },
  "する": { masu: "します", te: "して", nai: "しない", ta: "した" },
  "勉強する": { masu: "勉強します", te: "勉強して", nai: "勉強しない" },
  "来る": { masu: "来ます", te: "来て", nai: "来ない", ta: "来た" }
};
for (const d in table) for (const t in table[d]) eq("conj " + d + " " + t, JA.conj.conj(verb(d), t).surface, table[d][t]);
eq("conj 来る nai kana", JA.conj.conj(verb("来る"), "nai").kana, "こない");
eq("conj 来る masu kana", JA.conj.conj(verb("来る"), "masu").kana, "きます");
eq("conj 行く te kana", JA.conj.conj(verb("行く"), "te").kana, "いって");

// ---------- strategy: exact-kana ----------
eq("kana correct", V("exact-kana", "ka", { target: "か" }).verdict, "correct");
eq("kana correct typed", V("exact-kana", "か", { target: "か" }).verdict, "correct");
eq("kana wrong", V("exact-kana", "ki", { target: "か" }).verdict, "wrong");
eq("kana katakana from romaji", V("exact-kana", "ka", { target: "カ", script: "katakana" }).verdict, "correct");
eq("kana script enforced", V("exact-kana", "か", { target: "カ", script: "katakana" }).diagnosis.code, "script");
eq("kana word near long vowel", V("exact-kana", "obasan", { target: "おばあさん" }).diagnosis.code, "long-vowel");

// ---------- strategy: reading-set ----------
const taberu = { forms: [{ w: "食べる", r: "たべる" }], taught: "食べる" };
eq("reading kanji", V("reading-set", "食べる", taberu).verdict, "correct");
eq("reading romaji kana", V("reading-set", "taberu", taberu).verdict, "accepted");
eq("reading kana note", !!V("reading-set", "たべる", taberu).note, true);
eq("reading near", V("reading-set", "taberi", taberu).verdict, "near");
eq("reading wrong", V("reading-set", "nomu", taberu).verdict, "wrong");
const kore = { forms: [{ w: "これ", r: "これ" }] };
eq("reading kana-only word", V("reading-set", "kore", kore).verdict, "correct");
const ojisan = { forms: [{ w: "おばあさん", r: "おばあさん" }] };
eq("reading long vowel diag", V("reading-set", "obasan", ojisan).diagnosis.code, "long-vowel");

// ---------- strategy: meaning-set ----------
const mEat = { glosses: ["to eat"] };
eq("meaning bare verb", V("meaning-set", "eat", mEat).verdict, "correct");
eq("meaning with to", V("meaning-set", "To eat.", mEat).verdict, "correct");
eq("meaning wrong", V("meaning-set", "drink", mEat).verdict, "wrong");
eq("meaning near", V("meaning-set", "umbrela", { glosses: ["umbrella"] }).verdict, "near");
eq("meaning article", V("meaning-set", "an umbrella", { glosses: ["umbrella"] }).verdict, "correct");

// ---------- strategy: conjugation with diagnosis ----------
const C = (d, t, a) => V("conjugation", a, { verb: verb(d), target: t });
eq("conj ok kanji", C("食べる", "masu", "食べます").verdict, "correct");
eq("conj ok romaji", C("食べる", "masu", "tabemasu").verdict, "accepted");
eq("conj kana-only verb", C("する", "masu", "shimasu").verdict, "correct");
eq("conj class godan→ichidan", C("帰る", "te", "帰て").diagnosis.code, "class");
eq("conj class ichidan→godan", C("食べる", "masu", "taberimasu").diagnosis.code, "class");
eq("conj te sound", C("書く", "te", "書きて").diagnosis.code, "te-sound");
eq("conj te sound kana", C("飲む", "te", "nomite").diagnosis.code, "te-sound");
eq("conj iku", C("行く", "te", "行いて").diagnosis.code, "iku");
eq("conj u-wa", C("買う", "nai", "kaanai").diagnosis.code, "u-wa");
eq("conj aru", C("ある", "nai", "aranai").diagnosis.code, "aru");
eq("conj other target", C("食べる", "masen", "食べます").diagnosis.code, "target");
eq("conj near slip", C("食べる", "masu", "tabemasi").verdict, "near");

// ---------- strategy: particle-slot ----------
const pWa = { target: "は", accept: { "が": "Also grammatical: が puts the focus on “this”, as an answer to “which one?”." }, wrong: { "を": "を marks what a verb acts on; です has no object." } };
eq("particle correct", V("particle-slot", "ha", pWa).verdict, "correct");
eq("particle typed sound", V("particle-slot", "wa", pWa).diagnosis.code, "particle-spelling");
eq("particle accepted", V("particle-slot", "ga", pWa).verdict, "accepted");
eq("particle wrong reason", V("particle-slot", "wo", pWa).diagnosis.code, "particle");

// ---------- strategy: order-graph ----------
const sent = { chunks: [{ id: "kore", t: "これは" }, { id: "hon", t: "本" }, { id: "desu", t: "です" }], last: "desu",
  before: [["kore", "hon", "The topic (これは) comes before what you say about it."]], natural: ["kore", "hon", "desu"] };
eq("order natural", V("order-graph", ["kore", "hon", "desu"], sent).verdict, "correct");
eq("order verb final", V("order-graph", ["kore", "desu", "hon"], sent).diagnosis.code, "verb-final");
eq("order constraint", V("order-graph", ["hon", "kore", "desu"], sent).diagnosis.code, "order");
const time = { chunks: [{ id: "ashita", t: "あした" }, { id: "watashi", t: "わたしは" }, { id: "iku", t: "行きます" }], last: "iku", before: [], natural: ["watashi", "ashita", "iku"] };
eq("order accepted variant", V("order-graph", ["ashita", "watashi", "iku"], time).verdict, "accepted");

// ---------- strategy: dictation (mora alignment) ----------
eq("dict correct", V("dictation", "kitte", { target: "きって" }).verdict, "correct");
eq("dict sokuon", V("dictation", "kite", { target: "きって" }).diagnosis.code, "sokuon");
eq("dict sokuon extra", V("dictation", "kitte", { target: "きて" }).diagnosis.code, "sokuon");
eq("dict long vowel", V("dictation", "obasan", { target: "おばあさん" }).diagnosis.code, "long-vowel");
eq("dict long vowel extra", V("dictation", "obaasan", { target: "おばさん" }).diagnosis.code, "long-vowel");
eq("dict ou long", V("dictation", "koko", { target: "こうこう" }).verdict, "wrong"); // two slips
eq("dict voicing", V("dictation", "kakko", { target: "がっこ" }).diagnosis.code, "voicing");
eq("dict yoon", V("dictation", "kiyou", { target: "きょう" }).diagnosis.code, "yoon");
eq("dict alt", V("dictation", "kore wa hon desu", { target: "これはほんです", alt: ["これわほんです"] }).verdict, "correct");
eq("dict punctuation", V("dictation", "これは、本です。".replace("本", "ほん"), { target: "これはほんです" }).verdict, "correct");
eq("dict katakana long mark", V("dictation", "コーコー", { target: "こうこう" }).verdict, "correct");
eq("dict ー in target", V("dictation", "けえき", { target: "けーき" }).verdict, "correct");
eq("dict long still matters", V("dictation", "ここ", { target: "こうこう" }).verdict, "wrong");
eq("dict おお spelling", V("dictation", "おおきい", { target: "おーきい" }).verdict, "correct");
eq("dict full width", V("dictation", "ｋｉｔｔｅ", { target: "きって" }).verdict, "correct");


// ---------- strategy: stroke (KanjiVG), on strokes synthesised from the reference ----------
{
  let seedN = 11; const rnd = () => ((seedN = (seedN * 1103515245 + 12345) >>> 0) / 4294967296 - 0.5);
  const jitter = (st, a, dx = 0, dy = 0) => st.map(p => [p[0] + rnd() * a + dx, p[1] + rnd() * a + dy]);
  const tally = { clean: [0, 0], wobbly: [0, 0], direction: [0, 0], order: [0, 0], count: [0, 0], shape: [0, 0] };
  const hit = (k, ok) => { tally[k][0] += ok ? 1 : 0; tally[k][1]++; };
  for (const ch of Object.keys(JA.strokes)) {
    const ref = JA.stroke.reference(ch);
    hit("clean", JA.stroke.check(ch, ref).verdict === "correct");
    const w = JA.stroke.check(ch, ref.map(st => jitter(st, 6, 3, -2)));
    hit("wobbly", w.verdict === "correct" || w.verdict === "accepted");
    const rev = ref.map((st, i) => i === 0 ? st.slice().reverse() : st);
    const rv = JA.stroke.check(ch, rev); // a dot (ゥ, ッ) has no direction to get wrong
    if (JA.stroke.length(ref[0]) >= 20) hit("direction", rv.diagnosis && rv.diagnosis.code === "direction");
    if (ref.length > 1) { const sw = ref.slice(); [sw[0], sw[1]] = [sw[1], sw[0]]; const so = JA.stroke.check(ch, sw); hit("order", so.diagnosis && so.diagnosis.code === "order"); }
    if (ref.length > 1) hit("count", JA.stroke.check(ch, ref.slice(0, -1)).diagnosis.code === "count");
    const sh = JA.stroke.check(ch, ref.map((st, i) => i === ref.length - 1 ? jitter(st, 0, 35, 0) : st)); hit("shape", sh.verdict === "wrong");
  }
  for (const k in tally) eq("stroke " + k + " " + tally[k][0] + "/" + tally[k][1], tally[k][0], tally[k][1]);
  console.log("strokes: " + Object.entries(tally).map(([k, v]) => k + " " + v[0] + "/" + v[1]).join(" · "));
}
console.log((fail ? "✗ " : "✓ ") + pass + " of " + (pass + fail) + " golden tests pass");
process.exit(fail ? 1 : 0);
