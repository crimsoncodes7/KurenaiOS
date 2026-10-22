// The voice bake-off (docs/japanese-plan.md §4.4): render lines.json with each provider's voice for
// each character into out/<provider>/<id>.<ext>, and out/manifest.json for voice.html (the blind
// listening page). Keys come from voice/.env.local (git-ignored) or the environment and are never
// printed.
//
//   node prototypes/japanese-space/voice/bake.mjs                 render every provider that is ready
//   node prototypes/japanese-space/voice/bake.mjs voicevox        one provider
//   node prototypes/japanese-space/voice/bake.mjs --list gemini   what voices/models a provider offers
//   add --force to re-render lines that already exist
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(HERE, "out");
const args = process.argv.slice(2), FORCE = args.includes("--force"), LIST = args.includes("--list");
const only = args.filter(a => !a.startsWith("--"));

// keys: .env.local lines KEY=value; the environment wins
const env = {};
try {
  for (const l of fs.readFileSync(path.join(HERE, ".env.local"), "utf8").split(/\r?\n/)) {
    const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/.exec(l); if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
} catch {}
const key = k => process.env[k] || env[k] || "";
const VOICEVOX = key("VOICEVOX_URL") || "http://127.0.0.1:50021";

const lines = JSON.parse(fs.readFileSync(path.join(HERE, "lines.json"), "utf8")).lines;
const cast = JSON.parse(fs.readFileSync(path.join(HERE, "voices.json"), "utf8"));
const plain = s => s.replace(/\{([^|]+)\|[^}]+\}/g, "$1");

async function ok(r, what) {
  if (r.ok) return r;
  let body = ""; try { body = (await r.text()).slice(0, 300); } catch {}
  throw new Error(what + " → HTTP " + r.status + " " + body.replace(/\s+/g, " "));
}
// 16-bit mono PCM → WAV
function wav(pcm, sr) {
  const h = Buffer.alloc(44);
  h.write("RIFF", 0); h.writeUInt32LE(36 + pcm.length, 4); h.write("WAVE", 8); h.write("fmt ", 12);
  h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(1, 22); h.writeUInt32LE(sr, 24);
  h.writeUInt32LE(sr * 2, 28); h.writeUInt16LE(2, 32); h.writeUInt16LE(16, 34); h.write("data", 36); h.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([h, pcm]);
}

// ---------- providers ----------
const P = {
  voicevox: {
    ext: "wav",
    ready: async () => { try { await ok(await fetch(VOICEVOX + "/version"), "VOICEVOX"); return true; } catch { return "the VOICEVOX app is not running (start it; its engine listens on " + VOICEVOX + ")"; } },
    async list() {
      const sp = await (await ok(await fetch(VOICEVOX + "/speakers"), "speakers")).json();
      return sp.map(s => s.name + ": " + s.styles.map(t => t.name + " (" + t.id + ")").join(", "));
    },
    _ids: null,
    async id(who) {
      const c = cast.voicevox[who];
      this._ids = this._ids || await (await ok(await fetch(VOICEVOX + "/speakers"), "speakers")).json();
      const s = this._ids.find(x => x.name === c.speaker);
      if (!s) throw new Error("VOICEVOX has no speaker " + c.speaker + " (run --list voicevox; some voices need a one-time download in the app)");
      const st = s.styles.find(x => x.name === c.style) || s.styles[0];
      return { id: st.id, label: "VOICEVOX:" + s.name + " (" + st.name + ")" };
    },
    async render(ln) {
      const v = await this.id(ln.who), c = cast.voicevox[ln.who];
      const q = await (await ok(await fetch(VOICEVOX + "/audio_query?speaker=" + v.id + "&text=" + encodeURIComponent(plain(ln.ja)), { method: "POST" }), "audio_query")).json();
      if (c.speedScale) q.speedScale = c.speedScale;
      const audio = Buffer.from(await (await ok(await fetch(VOICEVOX + "/synthesis?speaker=" + v.id, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(q) }), "synthesis")).arrayBuffer());
      // the accent the engine chose, as H/L per mora — what a learner hears as pitch
      const accent = q.accent_phrases.map(a => a.moras.map((m, i) => (a.accent === 1 ? i === 0 : i > 0 && i < a.accent) ? "H" : "L").join("")).join(" ");
      return { audio, voice: v.label, accent };
    }
  },

  elevenlabs: {
    ext: "mp3",
    ready: async () => key("ELEVENLABS_API_KEY") ? (cast.elevenlabs.akari.voice_id && cast.elevenlabs.yota.voice_id ? true : "no voice ids yet: run --list elevenlabs and put two in voices.json") : "no ELEVENLABS_API_KEY in voice/.env.local",
    async list() {
      const r = await (await ok(await fetch("https://api.elevenlabs.io/v1/voices", { headers: { "xi-api-key": key("ELEVENLABS_API_KEY") } }), "voices")).json();
      return r.voices.map(v => v.voice_id + "  " + v.name + "  [" + Object.values(v.labels || {}).join(", ") + "]");
    },
    async render(ln) {
      const c = cast.elevenlabs[ln.who];
      const r = await ok(await fetch("https://api.elevenlabs.io/v1/text-to-speech/" + encodeURIComponent(c.voice_id) + "?output_format=mp3_44100_128", {
        method: "POST", headers: { "Content-Type": "application/json", "xi-api-key": key("ELEVENLABS_API_KEY") },
        body: JSON.stringify({ text: plain(ln.ja), model_id: cast.elevenlabs.model, voice_settings: { stability: c.stability, similarity_boost: c.similarity_boost, style: c.style, use_speaker_boost: true } })
      }), "text-to-speech");
      return { audio: Buffer.from(await r.arrayBuffer()), voice: "ElevenLabs " + cast.elevenlabs.model + " · " + c.voice_id };
    }
  },

  gemini: {
    ext: "wav",
    ready: async () => key("GEMINI_API_KEY") ? true : "no GEMINI_API_KEY in voice/.env.local",
    async list() {
      const r = await (await ok(await fetch("https://generativelanguage.googleapis.com/v1beta/models?pageSize=200", { headers: { "x-goog-api-key": key("GEMINI_API_KEY") } }), "models")).json();
      return ["TTS models:"].concat(r.models.filter(m => /tts/i.test(m.name)).map(m => "  " + m.name.replace("models/", "")))
        .concat(["Prebuilt voices (all multilingual): Zephyr Puck Charon Kore Fenrir Leda Orus Aoede Callirrhoe Autonoe Enceladus Iapetus Umbriel Algieba Despina Erinome Algenib Rasalgethi Laomedeia Achernar Alnilam Schedar Gacrux Pulcherrima Achird Zubenelgenubi Vindemiatrix Sadachbia Sadaltager Sulafat"]);
    },
    async render(ln) {
      const c = cast.gemini[ln.who];
      // short, in the form Google documents ("Say cheerfully: …"): a long English direction was
      // sometimes read aloud before the line (4 of 12 on the first run). The voice is the voice name.
      const prompt = "Say in a " + ln.mood + " tone: " + plain(ln.ja);
      for (let attempt = 1; ; attempt++) {
        const r = await fetch("https://generativelanguage.googleapis.com/v1beta/models/" + cast.gemini.model + ":generateContent", {
          method: "POST", headers: { "Content-Type": "application/json", "x-goog-api-key": key("GEMINI_API_KEY") },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { responseModalities: ["AUDIO"], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: c.voice } } } } })
        });
        if (r.status === 429 && attempt < 4) { const wait = 20 * attempt; console.log("   rate limited; waiting " + wait + " s"); await new Promise(z => setTimeout(z, wait * 1000)); continue; }
        await ok(r, "generateContent");
        const j = await r.json(), part = j.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
        if (!part) throw new Error("no audio in the reply");
        const sr = +(/rate=(\d+)/.exec(part.inlineData.mimeType || "") || [0, 24000])[1];
        const pcm = Buffer.from(part.inlineData.data, "base64"), secs = pcm.length / 2 / sr;
        // a line takes about 0.2 s a character; far longer means it spoke the instruction too
        if (secs > plain(ln.ja).length * 0.3 + 3) throw new Error("the clip ran " + secs.toFixed(1) + " s: it read the instruction aloud");
        return { audio: wav(pcm, sr), voice: "Gemini " + cast.gemini.model + " · " + c.voice };
      }
    }
  }
};

// ---------- run ----------
const names = only.length ? only : Object.keys(P);
if (LIST) {
  for (const n of names) {
    const rd = await P[n].ready();
    if (rd !== true && !/voice ids/.test(rd)) { console.log("\n" + n + ": " + rd); continue; }
    console.log("\n" + n + ":"); try { (await P[n].list()).forEach(x => console.log("  " + x)); } catch (e) { console.log("  " + e.message); }
  }
  process.exit(0);
}
const manPath = path.join(OUT, "manifest.json");
const man = fs.existsSync(manPath) ? JSON.parse(fs.readFileSync(manPath, "utf8")) : { providers: {} };
for (const n of names) {
  const rd = await P[n].ready();
  if (rd !== true) { console.log(n + ": skipped — " + rd); continue; }
  fs.mkdirSync(path.join(OUT, n), { recursive: true });
  const rec = man.providers[n] = man.providers[n] || { lines: {} };
  console.log(n + ":");
  for (const ln of lines) {
    const file = path.join(OUT, n, ln.id + "." + P[n].ext);
    if (!FORCE && fs.existsSync(file) && rec.lines[ln.id] && !rec.lines[ln.id].error) { console.log("   " + ln.id + " (kept)"); continue; }
    const t0 = Date.now();
    try {
      const r = await P[n].render(ln);
      fs.writeFileSync(file, r.audio);
      rec.lines[ln.id] = { file: n + "/" + ln.id + "." + P[n].ext, voice: r.voice, accent: r.accent || null, ms: Date.now() - t0, bytes: r.audio.length, chars: plain(ln.ja).length };
      console.log("   " + ln.id + "  " + (Date.now() - t0) + " ms  " + (r.accent ? "accent " + r.accent : ""));
    } catch (e) { rec.lines[ln.id] = { error: e.message }; console.log("   " + ln.id + "  ✗ " + e.message); }
  }
  fs.writeFileSync(manPath, JSON.stringify(man, null, 1));
}
fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(manPath, JSON.stringify(man, null, 1));
console.log("\nOpen prototypes/japanese-space/voice.html to listen.");
