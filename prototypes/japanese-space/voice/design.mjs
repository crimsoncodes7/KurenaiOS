// ElevenLabs Voice Design for the bake-off. NEEDS A PAID PLAN: on the free plan the API refuses both
// library voices (402) and creating a voice (403, 22 October 2026). On the free plan, design the two
// voices on the website with the descriptions and samples below; a voice of your own is usable here.
// A voice you design is your own. For each character: three previews from a description and a
// Japanese sample (kept in out/design/ to listen to), the chosen one saved as a voice, and its id
// written into voices.json. Keys come from voice/.env.local and are never printed.
//
//   node prototypes/japanese-space/voice/design.mjs            design both, keep preview 1
//   node prototypes/japanese-space/voice/design.mjs yota 2     save Yōta's preview 2 instead (no new design)
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(HERE, "out", "design");
const env = {};
try { for (const l of fs.readFileSync(path.join(HERE, ".env.local"), "utf8").split(/\r?\n/)) { const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/.exec(l); if (m) env[m[1]] = m[2]; } } catch {}
const KEY = process.env.ELEVENLABS_API_KEY || env.ELEVENLABS_API_KEY;
if (!KEY) throw new Error("no ELEVENLABS_API_KEY in voice/.env.local");

const DESIGN = {
  akari: {
    name: "KOS Akari",
    description: "A young Japanese woman in her early twenties speaking native standard Tokyo Japanese. Calm, kind and gentle, polite and quietly amused; a soft, warm, youthful mid-high voice with clear articulation. Natural anime-heroine voice-acting quality, studio-clean recording.",
    text: "はじめまして、白石灯です。今日からあなたの案内役になりました。わからないことがあったら、遠慮しないで何でも聞いてくださいね。まずは、このカフェでゆっくりお話ししましょう。ケーキも紅茶もおいしいんですよ。楽しみですね。"
  },
  yota: {
    name: "KOS Yota",
    description: "A young Japanese man in his early twenties speaking native standard Tokyo Japanese. Energetic, friendly and a bit goofy, casual tone; a bright, youthful light tenor voice, lively and expressive like a cheerful anime protagonist. Studio-clean recording.",
    text: "よっ、朝日陽太だ！これからよろしくな！なあなあ、あのケーキ、めっちゃうまそうじゃない？え、あれって猫なの？マジかよ、全然気づかなかったぜ。じゃあ、一緒に行こうぜ！夕方、駅前のカフェで待ってるからな。絶対来いよ！"
  }
};

async function call(url, body) {
  const r = await fetch("https://api.elevenlabs.io" + url, { method: "POST", headers: { "xi-api-key": KEY, "Content-Type": "application/json" }, body: JSON.stringify(body) });
  if (!r.ok) throw new Error(url + " → HTTP " + r.status + " " + (await r.text()).slice(0, 300));
  return r.json();
}

const voicesPath = path.join(HERE, "voices.json"), cast = JSON.parse(fs.readFileSync(voicesPath, "utf8"));
const [onlyWho, pickArg] = process.argv.slice(2);
fs.mkdirSync(OUT, { recursive: true });
const index = fs.existsSync(path.join(OUT, "previews.json")) ? JSON.parse(fs.readFileSync(path.join(OUT, "previews.json"), "utf8")) : {};

for (const who of Object.keys(DESIGN).filter(w => !onlyWho || w === onlyWho)) {
  const d = DESIGN[who];
  let previews = index[who];
  if (!previews || !pickArg) {
    console.log(who + ": designing (" + d.text.length + " characters of sample)…");
    const res = await call("/v1/text-to-voice/design", { voice_description: d.description, text: d.text, model_id: "eleven_multilingual_ttv_v2", auto_generate_text: false });
    previews = res.previews.map((p, i) => {
      const file = who + "-" + (i + 1) + ".mp3";
      fs.writeFileSync(path.join(OUT, file), Buffer.from(p.audio_base_64, "base64"));
      return { n: i + 1, file, generated_voice_id: p.generated_voice_id, secs: p.duration_secs };
    });
    index[who] = previews;
    fs.writeFileSync(path.join(OUT, "previews.json"), JSON.stringify(index, null, 1));
    previews.forEach(p => console.log("   preview " + p.n + "  " + p.file + "  " + (p.secs || "?") + " s"));
  }
  const pick = previews[(+pickArg || 1) - 1];
  const saved = await call("/v1/text-to-voice", { voice_name: d.name + " " + pick.n, voice_description: d.description, generated_voice_id: pick.generated_voice_id });
  cast.elevenlabs[who].voice_id = saved.voice_id;
  console.log("   saved preview " + pick.n + " as " + d.name + " " + pick.n + " → " + saved.voice_id);
}
fs.writeFileSync(voicesPath, JSON.stringify(cast, null, 2) + "\n");
console.log("\nvoices.json updated. Render with: node prototypes/japanese-space/voice/bake.mjs elevenlabs --force");
