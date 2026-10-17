/* Dev only: makes an ORIGINAL test "episode" for the clip importer — an animated canvas with the
   macOS Kyoko voice reading slice lines (tts-test/, local only), recorded to WebM in real time,
   plus a matching .srt. JA.devEpisode() → Promise<{video: Blob, srt: string, cues}>. */
(function () {
  "use strict";
  var LINES = ["これは本です", "それはペンです", "あれはねこです", "これはなんですか", "それはケーキです", "おばあさんです", "きってをかいます", "がっこうにいきます", "ちょっとまってください", "ありがとうございます"];
  var SHOW = { "これは本です": "これは本です。", "きってをかいます": "切手を買います。", "がっこうにいきます": "学校に行きます。", "ちょっとまってください": "ちょっと待ってください。" };
  function ts(t) { var ms = Math.round(t * 1000), h = Math.floor(ms / 3600000), m = Math.floor(ms / 60000) % 60, s = Math.floor(ms / 1000) % 60; return [h, m, s].map(function (x) { return String(x).padStart(2, "0"); }).join(":") + "," + String(ms % 1000).padStart(3, "0"); }
  window.JA = window.JA || {};
  JA.devEpisode = async function () {
    var all = await (await fetch("tts-test/lines.json")).json();
    var ctx = new AudioContext(), dest = ctx.createMediaStreamDestination(), bufs = [];
    for (var i = 0; i < LINES.length; i++) {
      var ab = await (await fetch("tts-test/Kyoko-" + all.indexOf(LINES[i]) + ".wav")).arrayBuffer();
      bufs.push(await ctx.decodeAudioData(ab));
    }
    var canvas = document.createElement("canvas"); canvas.width = 640; canvas.height = 360;
    var g = canvas.getContext("2d"), cues = [], t = 0.8;
    bufs.forEach(function (b, i) { cues.push({ start: t, end: t + b.duration, text: SHOW[LINES[i]] || LINES[i] + "。" }); t += b.duration + 0.9; });
    var total = t + 0.5;
    var stream = new MediaStream([canvas.captureStream(30).getVideoTracks()[0], dest.stream.getAudioTracks()[0]]);
    var rec = new MediaRecorder(stream, { mimeType: "video/webm;codecs=vp8,opus" }), chunks = [];
    rec.ondataavailable = function (e) { if (e.data.size) chunks.push(e.data); };
    var t0 = ctx.currentTime + 0.1;
    bufs.forEach(function (b, i) { var src = ctx.createBufferSource(); src.buffer = b; src.connect(dest); src.start(t0 + cues[i].start); });
    var draw = setInterval(function () {
      var now = ctx.currentTime - t0, k = cues.findIndex(function (c) { return now >= c.start - 0.4 && now <= c.end + 0.4; });
      g.fillStyle = "hsl(" + (20 + now * 8) % 360 + " 35% 22%)"; g.fillRect(0, 0, 640, 360);
      g.fillStyle = "hsl(30 80% 70%)"; g.beginPath(); g.arc(320 + Math.sin(now) * 180, 180 + Math.cos(now * 1.3) * 80, k >= 0 ? 46 : 30, 0, 7); g.fill();
      g.fillStyle = "rgba(255,255,255,.6)"; g.font = "600 18px sans-serif"; g.fillText("Test episode · scene " + (k >= 0 ? k + 1 : "-"), 20, 34);
    }, 33);
    rec.start(250);
    await new Promise(function (r) { setTimeout(r, (total + 0.2) * 1000); });
    rec.stop(); clearInterval(draw);
    await new Promise(function (r) { rec.onstop = r; });
    ctx.close();
    var srt = cues.map(function (c, i) { return (i + 1) + "\n" + ts(c.start) + " --> " + ts(c.end) + "\n" + c.text + "\n"; }).join("\n");
    return { video: new Blob(chunks, { type: "video/webm" }), srt: srt, cues: cues };
  };
})();
