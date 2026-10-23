// tools/bake_ja_audio.mjs — Japanese's audio pack (docs/japanese-plan.md §4.4).
//
// Collects every line the app speaks (lesson lines, scenes and panels, pattern examples, the
// shadowing sets, kana, minimal pairs, words, kanji in their words, grammar examples), renders
// each ONCE in its speaker's voice and writes the map the app reads, js/data/ja-audio.js
// (window.KOS_JA_AUDIO["<who>|<text>"] = "<who>/<hash>.<ext>", under assets/ja/audio/).
//
//   the cast (akari, yota, makoto)  ElevenLabs, the voices designed on the website
//                                   (prototypes/japanese-space/voice/voices.json)
//   the narrator                    VOICEVOX (the desktop app, http://127.0.0.1:50021), No.7
//
// A speaker without a voice yet is skipped and keeps the browser's voice. A file that exists is
// never rendered again (its name is a hash of the voice and the text). The key lives in the
// git-ignored voice/.env.local and is never printed.
//
//   node tools/bake_ja_audio.mjs            render what is missing, write the map
//   node tools/bake_ja_audio.mjs --dry      count the lines and characters, render nothing
//   node tools/bake_ja_audio.mjs --check    exit 1 when a line has no file (the map is stale)
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { boot, ROOT } = require("./lib/app-harness");
const args = process.argv.slice(2), DRY = args.includes("--dry"), CHECK = args.includes("--check");
const OUT = path.join(ROOT, "assets/ja/audio"), MAP = path.join(ROOT, "js/data/ja-audio.js");
const VOICE_DIR = path.join(ROOT, "prototypes/japanese-space/voice");

const env = {};
try {
  for (const l of fs.readFileSync(path.join(VOICE_DIR, ".env.local"), "utf8").split(/\r?\n/)) {
    const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/.exec(l); if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
} catch {}
const key = k => process.env[k] || env[k] || "";
const VOICEVOX = key("VOICEVOX_URL") || "http://127.0.0.1:50021";
const cast = JSON.parse(fs.readFileSync(path.join(VOICE_DIR, "voices.json"), "utf8"));
const NARRATOR = { speaker: "No.7", style: "アナウンス", speedScale: 0.95 };

// the app's own key: jaui.js voiceFile() = who + "|" + plain(text), line breaks dropped
const plain = s => String(s).replace(/\{([^|}]+)\|[^}]+\}/g, "$1").replace(/\n/g, "");
// what is sent: every kanji with furigana is sent as its reading, so no voice can misread it
const spoken = s => String(s).replace(/\{[^|}]+\|([^}]+)\}/g, "$1").replace(/\n/g, "");

// ---------- collect ----------
async function collect() {
  const app = await boot();
  const J = app.window.KOS_JA, C = app.window.KOS_CONTENT, out = new Map();
  const add = (who, text) => {
    if (!text || typeof text !== "string") return;
    who = ["akari", "yota", "makoto"].includes(who) ? who : "narrator";
    const k = who + "|" + plain(text);
    if (!out.has(k)) out.set(k, { who, key: k, text: spoken(text), plain: plain(text) });
  };
  function walk(o, who) {
    if (!o || typeof o !== "object") return;
    if (Array.isArray(o)) return o.forEach(x => walk(x, who));
    const w = o.who || who;
    if (typeof o.ja === "string") add(w, o.ja);
    if (o.pattern && o.pattern.eg) add("narrator", o.pattern.eg);
    if (Array.isArray(o.kana)) o.kana.forEach(ch => add("narrator", ch));
    if (Array.isArray(o.pair)) o.pair.forEach(x => add("narrator", x));
    for (const [k, v] of Object.entries(o)) if (v && typeof v === "object" && k !== "pattern") walk(v, w);
  }
  Object.keys(J.LESSONS).forEach(id => walk(C["ja:" + id], null));
  for (const [id, it] of Object.entries(J.ITEMS)) {
    if (/^k:/.test(id)) add("narrator", it.w);
    if (/^w:/.test(id)) add("narrator", it.r);
    if (/^j:/.test(id) && J.ITEMS[it.in]) add("narrator", J.ITEMS[it.in].r);
    if (/^g:/.test(id)) (it.says || []).forEach(s => add("narrator", s.ja));
    if (/^s:/.test(id)) (it.pairs || []).forEach(p => p.forEach(x => add("narrator", x)));
  }
  return [...out.values()];
}

// ---------- voices ----------
async function ok(r, what) {
  if (r.ok) return r;
  let body = ""; try { body = (await r.text()).slice(0, 200); } catch {}
  throw new Error(what + " → HTTP " + r.status + " " + body.replace(/\s+/g, " "));
}
const kata = s => s.replace(/[\u3041-\u3096]/g, c => String.fromCharCode(c.charCodeAt(0) + 0x60));
let vvId = null;
const V = {
  narrator: {
    ext: "m4a",
    async voice() {
      try { await ok(await fetch(VOICEVOX + "/version"), "VOICEVOX"); } catch { return null; }
      if (vvId === null) {
        const sp = await (await ok(await fetch(VOICEVOX + "/speakers"), "speakers")).json();
        const s = sp.find(x => x.name === NARRATOR.speaker), st = s && (s.styles.find(x => x.name === NARRATOR.style) || s.styles[0]);
        if (!st) throw new Error("VOICEVOX has no " + NARRATOR.speaker + " (download it in the app)");
        vvId = st.id;
      }
      return "voicevox2:" + vvId + ":" + NARRATOR.speedScale;
    },
    // the kanji text first (the engine's dictionary knows its accent), the reading when that
    // misreads; neither matching is printed as a reading to listen to
    async render(ln, file) {
      let q = null, warn = null;
      for (const text of [...new Set([ln.plain, ln.text])]) {
        const t = await (await ok(await fetch(VOICEVOX + "/audio_query?speaker=" + vvId + "&text=" + encodeURIComponent(text), { method: "POST" }), "audio_query")).json();
        const r = reads(t, ln.text);
        if (r === true) { q = t; warn = null; break; }
        if (!q) { q = t; warn = r; }
      }
      q.speedScale = NARRATOR.speedScale;
      const wav = Buffer.from(await (await ok(await fetch(VOICEVOX + "/synthesis?speaker=" + vvId, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(q) }), "synthesis")).arrayBuffer());
      const tmp = file + ".wav"; fs.writeFileSync(tmp, wav);
      execFileSync("afconvert", ["-f", "m4af", "-d", "aac", "-b", "64000", tmp, file]);
      fs.unlinkSync(tmp);
      return warn;
    }
  }
};
// reads(query, reading) → true, or what the engine read. The engine writes a long vowel as the
// vowel (コオヒイ) and the particles は・を・へ as ワ・オ・エ at a phrase's end; both are folded.
const VOWEL = { ア: "アカサタナハマヤラワガザダバパャ", イ: "イキシチニヒミリギジヂビピ", ウ: "ウクスツヌフムユルグズヅブプュ", エ: "エケセテネヘメレゲゼデベペ", オ: "オコソトノホモヨロゴゾドボポョ" };
const vowelOf = c => Object.keys(VOWEL).find(v => VOWEL[v].includes(c)) || null;
function fold(s) {
  let out = "";
  for (const c of s) {
    const prev = out[out.length - 1], pv = prev && vowelOf(prev);
    if (c === "ー" && pv) out += pv;
    else if (c === "ウ" && pv === "オ") out += "オ";
    else if (c === "イ" && pv === "エ") out += "エ";
    else out += c;
  }
  return out.replace(/ヲ/g, "オ").replace(/ヂ/g, "ジ").replace(/ヅ/g, "ズ").replace(/[ァィゥェォャュョ]/g, c => "アイウエオヤユヨ"["ァィゥェォャュョ".indexOf(c)]);
}
function reads(q, reading) {
  const phrases = q.accent_phrases.map(a => a.moras.map(m => m.text).join(""));
  const heard = phrases.join("");
  const want = fold(kata(reading).replace(/[^\u30a1-\u30fc]/g, ""));
  // a phrase-final ワ/エ may be は/へ in the text
  let h = fold(heard), w = want;
  if (h === w) return true;
  const ends = []; let at = 0;
  phrases.forEach(p => { at += fold(p).length; ends.push(at - 1); });
  if (h.length === w.length && [...h].every((c, i) => c === w[i] || (ends.includes(i) && ((c === "ワ" && w[i] === "ハ") || (c === "エ" && w[i] === "ヘ"))))) return true;
  return heard;
}
for (const who of ["akari", "yota", "makoto"]) V[who] = {
  ext: "mp3",
  async voice() { const c = cast.elevenlabs[who]; return c && c.voice_id && key("ELEVENLABS_API_KEY") ? "eleven:" + cast.elevenlabs.model + ":" + c.voice_id : null; },
  async render(ln, file) {
    const c = cast.elevenlabs[who];
    for (let attempt = 1; ; attempt++) {
      const r = await fetch("https://api.elevenlabs.io/v1/text-to-speech/" + encodeURIComponent(c.voice_id) + "?output_format=mp3_44100_128", {
        method: "POST", headers: { "Content-Type": "application/json", "xi-api-key": key("ELEVENLABS_API_KEY") },
        body: JSON.stringify({ text: ln.text, model_id: cast.elevenlabs.model, language_code: "ja",
          voice_settings: { stability: c.stability, similarity_boost: c.similarity_boost, style: c.style, use_speaker_boost: true } })
      });
      if (r.status === 429 && attempt < 4) { await new Promise(z => setTimeout(z, 5000 * attempt)); continue; }
      await ok(r, "text-to-speech");
      fs.writeFileSync(file, Buffer.from(await r.arrayBuffer()));
      return null;
    }
  }
};

// ---------- run ----------
const lines = await collect();
const by = {};
lines.forEach(l => { const b = by[l.who] = by[l.who] || { lines: 0, chars: 0 }; b.lines++; b.chars += l.text.length; });
console.log(lines.length + " lines: " + Object.entries(by).map(([w, b]) => w + " " + b.lines + " (" + b.chars + " characters)").join(", "));
if (DRY) process.exit(0);

const map = {}, missing = [], warns = [];
let made = 0;
for (const who of Object.keys(by)) {
  const v = V[who], voice = await v.voice();
  if (!voice) { console.log(who + ": no voice yet — the browser's voice speaks its " + by[who].lines + " lines"); continue; }
  fs.mkdirSync(path.join(OUT, who), { recursive: true });
  for (const ln of lines.filter(l => l.who === who)) {
    const name = who + "/" + crypto.createHash("sha1").update(voice + "|" + (who === "narrator" ? ln.key : ln.text)).digest("hex").slice(0, 12) + "." + v.ext;
    const file = path.join(OUT, name);
    if (!fs.existsSync(file)) {
      if (CHECK) { missing.push(ln.key); continue; }
      try { const w = await v.render(ln, file); made++; if (w) warns.push(ln.key + "  → engine read " + w); }
      catch (e) { console.log("  ✗ " + ln.key + ": " + e.message); continue; }
    }
    map[ln.key] = name;
  }
}
if (CHECK) {
  if (missing.length) { console.log(missing.length + " lines have no file, e.g. " + missing.slice(0, 5).join(" · ")); process.exit(1); }
  console.log("every voiced line has its file"); process.exit(0);
}
const sorted = Object.fromEntries(Object.keys(map).sort().map(k => [k, map[k]]));
fs.writeFileSync(MAP, "/* GENERATED by tools/bake_ja_audio.mjs — never hand-edit. Japanese's audio pack: \"<who>|<text>\" → its\n" +
  "   file under assets/ja/audio/. The cast: ElevenLabs (voices designed for this app); the narrator:\n" +
  "   VOICEVOX:No.7. A line not here is spoken by the browser's voice. */\n" +
  "window.KOS_JA_AUDIO = " + JSON.stringify(sorted, null, 0).replace(/","/g, "\",\n  \"").replace(/^\{"/, "{\n  \"").replace(/"\}$/, "\"\n}") + ";\n");
console.log("rendered " + made + ", mapped " + Object.keys(map).length + " → " + path.relative(ROOT, MAP));
if (warns.length) { console.log("\nreadings to listen to (VOICEVOX's moras differ from the text):"); warns.forEach(w => console.log("  " + w)); }
process.exit(0);
