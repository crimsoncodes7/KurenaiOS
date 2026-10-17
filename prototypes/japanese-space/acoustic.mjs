// Synthetic check of the acoustic pipeline (Spike S): renders each candidate's predicted timing as
// audio (harmonic voicing, noise, silence) with random speech rate and per-segment jitter, then
// asks decide() which candidate it hears. This proves the pipeline, not real speech — the spike
// page measures that on your recordings. Run: node prototypes/japanese-space/acoustic.mjs
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
require("./kana.js"); require("./jaacoustic.js");
const A = globalThis.JA.acoustic, SR = 16000;
let seed = +(process.env.SEED || 3); const rnd = () => ((seed = (seed * 1103515245 + 12345) >>> 0) / 4294967296);

// a speaker: a base pace, varying ±8% between utterances in one session
const SPEAKER = 0.13; // default pace
function render(kana, pace) {
  const segs = A.predict(kana), mora = (pace || SPEAKER) * (0.92 + rnd() * 0.16), out = [];
  const pad = (n, amp) => { for (let i = 0; i < n; i++) out.push((rnd() - 0.5) * amp); };
  pad(SR * 0.2, 0.002);
  let f0 = 110 + rnd() * 120, ph = 0;
  for (const s of segs) {
    const n = Math.round(s.dur * mora * (0.8 + rnd() * 0.4) * SR);
    for (let i = 0; i < n; i++) {
      if (s.lab === "v") { f0 *= 1 + (rnd() - 0.5) * 0.0004; ph += 2 * Math.PI * f0 / SR; out.push(0.3 * Math.sin(ph) + 0.15 * Math.sin(2 * ph) + 0.08 * Math.sin(3 * ph) + (rnd() - 0.5) * 0.01); }
      else if (s.lab === "u") out.push((rnd() - 0.5) * 0.12);
      else out.push((rnd() - 0.5) * 0.002);
    }
  }
  pad(SR * 0.2, 0.002);
  return Float32Array.from(out);
}

// YIN sanity: a 200 Hz tone
const tone = Float32Array.from({ length: 512 }, (_, i) => Math.sin(2 * Math.PI * 200 * i / SR));
const y = A.yin(tone, SR);
let fail = 0;
if (Math.abs(y.f0 - 200) > 3) { fail++; console.log("✗ YIN 200 Hz →", y.f0); }

// Six synthetic speakers (pace 110–170 ms a mora), each calibrated once on ありがとうございます.
// Pass bar over all of them: ≥ 85% right per pair, and a CONFIDENT call right ≥ 95% of the time —
// an unsure call asks you to say it again instead of marking you, so its precision is what matters.
const pairs = [["きて", "きって"], ["かこ", "かっこ"], ["おばさん", "おばあさん"], ["ここ", "こうこう"], ["いえ", "いいえ"]];
const tally = pairs.map(() => ({ ok: 0, n: 0, conf: 0, confOk: 0 }));
for (const pace of [0.11, 0.12, 0.13, 0.145, 0.155, 0.17]) {
  const mora = A.calibrate(A.analyse(render(A.CALIBRATION, pace), SR));
  pairs.forEach(([a, b], pi) => {
    for (let t = 0; t < 30; t++) {
      const say = t % 2 ? b : a, d = A.decide(A.analyse(render(say, pace), SR), [a, b], { mora }), T = tally[pi];
      T.n++; if (d.heard === say) T.ok++; if (d.confident) { T.conf++; if (d.heard === say) T.confOk++; }
    }
  });
}
pairs.forEach(([a, b], i) => {
  const T = tally[i], prec = T.conf ? T.confOk / T.conf : 1;
  const line = `${a} / ${b}: ${T.ok}/${T.n} right · confident ${T.conf}, of which ${Math.round(prec * 100)}% right`;
  if (T.ok < T.n * 0.85 || prec < 0.95) { fail++; console.log("✗ " + line); } else console.log("✓ " + line);
});
process.exit(fail ? 1 : 0);
