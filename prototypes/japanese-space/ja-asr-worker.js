// Whisper in a module worker (Spike S). transformers.js 4.3.0 from jsDelivr; the model is
// downloaded from Hugging Face once and kept in the browser's cache. WebGPU when the device has
// an adapter, WASM otherwise. The real space would seal fetch etc. after warm-up (plan §13).
import { pipeline, env } from "https://cdn.jsdelivr.net/npm/@huggingface/transformers@4.3.0";

env.allowLocalModels = false;
let asr = null, device = "wasm";

async function hasGpu() {
  try { return !!(self.navigator.gpu && await self.navigator.gpu.requestAdapter()); } catch (e) { return false; }
}

self.onmessage = async (e) => {
  const m = e.data;
  if (m.type === "load") {
    try {
      device = (await hasGpu()) ? "webgpu" : "wasm";
      const files = {};
      asr = await pipeline("automatic-speech-recognition", m.model, {
        device,
        dtype: device === "webgpu" ? { encoder_model: "fp32", decoder_model_merged: "q4" } : "q8",
        progress_callback: (p) => {
          if (p.status === "progress" && p.file) { files[p.file] = [p.loaded || 0, p.total || 0]; }
          const t = Object.values(files).reduce((a, f) => [a[0] + f[0], a[1] + f[1]], [0, 0]);
          self.postMessage({ type: "progress", loaded: t[0], total: t[1], status: p.status, file: p.file });
        }
      });
      // warm up once so the first real clip is not also paying for compilation
      await asr(new Float32Array(16000), { language: "japanese", task: "transcribe" });
      self.postMessage({ type: "ready", device });
    } catch (err) {
      self.postMessage({ type: "error", message: String(err && err.message || err) });
    }
    return;
  }
  if (m.type === "run") {
    const t0 = performance.now();
    try {
      // a spoken answer is a few seconds: 64 tokens is plenty, and it stops a hallucination loop early
      const out = await asr(m.pcm, { language: "japanese", task: "transcribe", return_timestamps: false, max_new_tokens: 64, no_repeat_ngram_size: 4 });
      self.postMessage({ type: "result", id: m.id, text: (out && out.text || "").trim(), ms: Math.round(performance.now() - t0) });
    } catch (err) {
      self.postMessage({ type: "error-run", id: m.id, message: String(err && err.message || err) });
    }
  }
};
