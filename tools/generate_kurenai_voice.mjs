/* Generate the Phase 1 Kurenai voice pack through ElevenLabs.
   The caller must provide ELEVENLABS_API_KEY in the process environment.
   No credential is read from or written to the repository. */
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const API_KEY = process.env.ELEVENLABS_API_KEY;
const VOICE_ID = process.env.ELEVENLABS_VOICE_ID || "ICOJthnGi6H0IDnQEUdz";
const MODEL_ID = process.env.ELEVENLABS_MODEL_ID || "eleven_multilingual_v2";

if (!API_KEY) throw new Error("ELEVENLABS_API_KEY is required for this one-time generation command.");

const clips = [
  ["state/idle.mp3", "I’m here when you need me."],
  ["state/thinking.mp3", "Give me a moment."],
  ["state/working.mp3", "I’m on it."],
  ["state/success.mp3", "All set."],
  ["state/error.mp3", "That didn’t work. Let’s try another way."],
  ["state/confirmation.mp3", "I need your approval before I continue."],

  ["interaction/hover-01.mp3", "You can say hello, you know."],
  ["interaction/hover-02.mp3", "Need a hand?"],
  ["interaction/hover-03.mp3", "I’m listening."],
  ["interaction/hover-04.mp3", "Still with me?"],

  ["interaction/head-01.mp3", "Careful. I was thinking."],
  ["interaction/head-02.mp3", "You have my attention."],
  ["interaction/head-03.mp3", "That’s one way to get my attention."],
  ["interaction/head-04.mp3", "All right, I’m listening."],

  ["interaction/flower-01.mp3", "You noticed the blossom."],
  ["interaction/flower-02.mp3", "It is my favourite detail."],
  ["interaction/flower-03.mp3", "The bloom suits me, don’t you think?"],
  ["interaction/flower-04.mp3", "A little colour helps."],

  ["interaction/tablet-01.mp3", "Looking for my notes?"],
  ["interaction/tablet-02.mp3", "Everything’s organised."],
  ["interaction/tablet-03.mp3", "One thing at a time."],
  ["interaction/tablet-04.mp3", "I’ve got it all here."]
];

async function render(text, attempt = 1) {
  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(VOICE_ID)}?output_format=mp3_44100_128`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": API_KEY
      },
      body: JSON.stringify({
        text,
        model_id: MODEL_ID,
        voice_settings: {
          stability: 0.44,
          similarity_boost: 0.82,
          style: 0.32,
          use_speaker_boost: true
        }
      })
    }
  );
  if (response.status === 429 && attempt < 4) {
    const delay = Math.max(750, Number(response.headers.get("retry-after") || 1) * 1000);
    await new Promise(resolveDelay => setTimeout(resolveDelay, delay));
    return render(text, attempt + 1);
  }
  if (!response.ok) {
    const detail = (await response.text()).replace(/sk_[A-Za-z0-9_-]+/g, "[redacted]").slice(0, 500);
    throw new Error(`ElevenLabs returned ${response.status}: ${detail}`);
  }
  const bytes = new Uint8Array(await response.arrayBuffer());
  if (bytes.length < 500) throw new Error("ElevenLabs returned an unexpectedly small audio payload.");
  return bytes;
}

for (const [relativePath, text] of clips) {
  const output = resolve(ROOT, "assets/assistant/voice", relativePath);
  await mkdir(dirname(output), { recursive: true });
  const bytes = await render(text);
  await writeFile(output, bytes);
  console.log(`${relativePath}\t${bytes.length} bytes`);
}

console.log(`Generated ${clips.length} local ElevenLabs clips with voice ${VOICE_ID}.`);
