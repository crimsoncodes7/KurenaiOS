/* Recording and the two recognisers behind one interface (docs/japanese-plan.md §13, Spike S).
   JA.audio.record() captures the microphone as 16 kHz mono PCM (for Whisper and the acoustic
   checks); JA.asr.web listens live through the browser's recogniser; JA.asr.whisper transcribes
   PCM in a module worker. Recordings stay in memory on this device. Throwaway slice code. */
(function (G) {
  "use strict";
  var JA = G.JA = G.JA || {};

  async function toPcm16k(blob) {
    var buf = await blob.arrayBuffer();
    var ctx = new (G.AudioContext || G.webkitAudioContext)();
    var audio = await ctx.decodeAudioData(buf); ctx.close();
    var len = Math.ceil(audio.duration * 16000);
    var off = new OfflineAudioContext(1, len, 16000), src = off.createBufferSource();
    src.buffer = audio; src.connect(off.destination); src.start();
    var out = await off.startRendering();
    return out.getChannelData(0).slice();
  }

  /* record({maxMs, onLevel}) → {stop(), done: Promise<{pcm, sr, blob, ms}>}. Raw capture: no echo
     cancellation, noise suppression or gain control, because they reshape exactly the timing and
     pitch the acoustic checks measure. */
  function record(opts) {
    opts = opts || {};
    var stopFn, t0 = Date.now();
    var done = navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false, channelCount: 1 } }).then(function (stream) {
      return new Promise(function (resolve, reject) {
        var rec = new MediaRecorder(stream), chunks = [], raf = 0;
        var ctx = new (G.AudioContext || G.webkitAudioContext)(), an = ctx.createAnalyser(); an.fftSize = 512;
        ctx.createMediaStreamSource(stream).connect(an);
        var data = new Float32Array(an.fftSize);
        (function level() { an.getFloatTimeDomainData(data); var m = 0; for (var i = 0; i < data.length; i++) m = Math.max(m, Math.abs(data[i])); if (opts.onLevel) opts.onLevel(m); raf = requestAnimationFrame(level); })();
        rec.ondataavailable = function (e) { if (e.data.size) chunks.push(e.data); };
        rec.onstop = function () {
          cancelAnimationFrame(raf); ctx.close(); stream.getTracks().forEach(function (t) { t.stop(); });
          var blob = new Blob(chunks, { type: rec.mimeType });
          toPcm16k(blob).then(function (pcm) { resolve({ pcm: pcm, sr: 16000, blob: blob, ms: Date.now() - t0 }); }, reject);
        };
        rec.start();
        var timer = setTimeout(function () { if (rec.state === "recording") rec.stop(); }, opts.maxMs || 6000);
        stopFn = function () { clearTimeout(timer); if (rec.state === "recording") rec.stop(); };
      });
    });
    return { stop: function () { if (stopFn) stopFn(); }, done: done };
  }

  // ---------- the browser's recogniser (Chrome sends the audio to Google; Safari varies) ----------
  var SR = G.SpeechRecognition || G.webkitSpeechRecognition;
  var web = {
    available: !!SR,
    /* listen() → {stop(), done: Promise<{alts, ms}>}; runs alongside record() on the same microphone. */
    listen: function () {
      var rec = new SR(), t0 = Date.now(), stopAt = 0;
      rec.lang = "ja-JP"; rec.interimResults = false; rec.maxAlternatives = 3; rec.continuous = false;
      var done = new Promise(function (resolve) {
        var alts = [];
        rec.onresult = function (e) { alts = Array.prototype.map.call(e.results[0], function (a) { return a.transcript; }); };
        rec.onerror = function (e) { resolve({ alts: [], error: e.error, ms: Date.now() - (stopAt || t0) }); };
        rec.onend = function () { resolve({ alts: alts, ms: Date.now() - (stopAt || t0) }); };
      });
      rec.start();
      return { stop: function () { stopAt = Date.now(); try { rec.stop(); } catch (e) {} }, done: done };
    }
  };

  // ---------- Whisper on the device (transformers.js in a module worker) ----------
  var worker = null, pending = {}, seq = 0, listeners = [];
  var whisper = {
    state: "off", model: null, device: null,
    on: function (fn) { listeners.push(fn); },
    load: function (model) {
      if (!worker) {
        worker = new Worker("ja-asr-worker.js?v=" + Date.now(), { type: "module" });
        worker.onmessage = function (e) {
          var m = e.data;
          if (m.type === "result" || m.type === "error-run") { var p = pending[m.id]; delete pending[m.id]; if (p) (m.type === "result" ? p.resolve : p.reject)(m); return; }
          if (m.type === "ready") { whisper.state = "ready"; whisper.device = m.device; }
          if (m.type === "error") whisper.state = "error";
          listeners.forEach(function (fn) { fn(m); });
        };
      }
      whisper.state = "loading"; whisper.model = model;
      worker.postMessage({ type: "load", model: model });
    },
    /* transcribe(pcm) → Promise<{text, ms}> */
    transcribe: function (pcm) {
      var id = ++seq;
      return new Promise(function (resolve, reject) { pending[id] = { resolve: resolve, reject: reject }; worker.postMessage({ type: "run", id: id, pcm: pcm }, [pcm.buffer]); });
    }
  };

  /* Whisper invents text on short or silent clips (it was trained on 30-second subtitled audio).
     A transcript that is a known hallucination, or far longer than the audio allows, is dropped. */
  var HALLUCINATIONS = [/ご視聴ありがとうございました/, /チャンネル登録/, /字幕/, /お疲れ様でした$/, /^(はい、?)+$/];
  function plausible(text, seconds) {
    var t = String(text || "").trim();
    if (!t) return { ok: false, why: "empty" };
    if (HALLUCINATIONS.some(function (re) { return re.test(t); })) return { ok: false, why: "a known Whisper hallucination" };
    var chars = t.replace(/[\s、。！？!?,.]/g, "").length;
    if (chars > Math.max(6, seconds * 12)) return { ok: false, why: "longer than " + seconds.toFixed(1) + " s of speech allows" };
    if (/(.{2,})\1\1/.test(t)) return { ok: false, why: "a repeated loop" };
    return { ok: true };
  }

  JA.audio = { record: record, toPcm16k: toPcm16k };
  JA.asr = { web: web, whisper: whisper, plausible: plausible };
})(typeof window !== "undefined" ? window : globalThis);
