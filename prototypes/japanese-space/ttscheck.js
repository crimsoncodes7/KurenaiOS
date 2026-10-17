/* The synthetic-voice baseline for Spike S: runs every scripted item, as spoken by macOS's Kyoko voice
   (tts-test/*.wav, made with `say -v Kyoko` and `afconvert`), through Whisper and the acoustic check.
   Usage on speech.html with Whisper loaded: await ttsCheck(["Kyoko", "Kyoko130", "Kyoko230"]).
   A clean synthetic voice is an optimistic stand-in for a learner; your own recordings decide. */
window.ttsCheck = async function (voices) {
  var JA = window.JA, src = await (await fetch("speech.js")).text();
  var items = new Function(src.slice(src.indexOf("var S = ["), src.indexOf("// ---------- state ----------")) + "; return items;")();
  var lines = await (await fetch("tts-test/lines.json")).json();
  async function pcmOf(voice, text) {
    var buf = await (await fetch("tts-test/" + voice + "-" + lines.indexOf(text) + ".wav")).arrayBuffer(), dv = new DataView(buf), off = 12;
    while (off < buf.byteLength) {
      var id = String.fromCharCode.apply(null, new Uint8Array(buf, off, 4)), sz = dv.getUint32(off + 4, true);
      if (id === "data") { var n = sz / 2, out = new Float32Array(n); for (var i = 0; i < n; i++) out[i] = dv.getInt16(off + 8 + i * 2, true) / 32768; return out; }
      off += 8 + sz + (sz % 2);
    }
    throw new Error("no data chunk in " + voice + " " + text);
  }
  var acc = function (v) { return v === "correct" || v === "accepted"; }, T = {}, rows = [];
  function bump(k, ok) { T[k] = T[k] || [0, 0]; T[k][1]++; if (ok) T[k][0]++; }
  for (var vi = 0; vi < voices.length; vi++) {
    var voice = voices[vi], mora = JA.acoustic.calibrate(JA.acoustic.analyse(await pcmOf(voice, "ありがとうございます"), 16000));
    for (var k = 0; k < items.length; k++) {
      var it = items[k], pcm = await pcmOf(voice, it.say), w = await JA.asr.whisper.transcribe(pcm.slice());
      var pl = JA.asr.plausible(w.text, pcm.length / 16000);
      var v = pl.ok ? JA.valid.check("dictation", w.text, { target: it.target, alt: (it.alt || []).concat(it.written ? [it.written] : []) }).verdict : "dropped";
      var g = it.kind + (it.mistake ? " · mistake caught" : " · correct accepted");
      bump("Whisper " + g, it.mistake ? !acc(v) : acc(v));
      var a = null;
      if (it.kind === "word") {
        var d = JA.acoustic.decide(JA.acoustic.analyse(pcm, 16000), it.pair, { mora: mora });
        a = d.confident ? d.heard : "unsure";
        bump("Acoustic " + g, it.mistake ? a !== it.target : a === it.target);
        if (d.confident) bump("Acoustic · confident calls right", d.heard === it.say);
      }
      rows.push({ voice: voice, id: it.id, said: it.say, whisper: w.text, verdict: v, acoustic: a, ms: w.ms });
    }
  }
  return { tally: T, rows: rows };
};
