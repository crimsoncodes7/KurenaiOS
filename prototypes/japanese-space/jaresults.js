/* The slice's test results, kept so one Download can hand them over (results.html).
   Recordings go to IndexedDB as 16 kHz 16-bit PCM — so the acoustic check can be re-tuned on your
   real voice later without recording again. Everything stays in this browser until you download it.
   Throwaway slice code. */
(function (G) {
  "use strict";
  var JA = G.JA = G.JA || {};
  var DB = "kurenai-ja-slice-results";
  function db() {
    return new Promise(function (res, rej) {
      var r = indexedDB.open(DB, 1);
      r.onupgradeneeded = function () { r.result.createObjectStore("audio", { keyPath: "id" }); };
      r.onsuccess = function () { res(r.result); }; r.onerror = function () { rej(r.error); };
    });
  }
  function tx(mode, fn) {
    return db().then(function (d) {
      return new Promise(function (res, rej) {
        var t = d.transaction("audio", mode), out = fn(t.objectStore("audio"));
        t.oncomplete = function () { res(out && out.result !== undefined ? out.result : undefined); }; t.onerror = function () { rej(t.error); };
      });
    });
  }
  function toInt16(f32) { var o = new Int16Array(f32.length); for (var i = 0; i < f32.length; i++) { var v = Math.max(-1, Math.min(1, f32[i])); o[i] = v < 0 ? v * 32768 : v * 32767; } return o; }
  function b64(int16) {
    var u8 = new Uint8Array(int16.buffer), s = "", CH = 0x8000;
    for (var i = 0; i < u8.length; i += CH) s += String.fromCharCode.apply(null, u8.subarray(i, i + CH));
    return btoa(s);
  }
  function read(key, fallback) { try { return JSON.parse(localStorage.getItem(key)) || fallback; } catch (e) { return fallback; } }

  JA.results = {
    /* putAudio(id, pcm Float32Array at 16 kHz) — copies, so the caller may transfer its buffer after */
    putAudio: function (id, pcm) { var a = toInt16(pcm); return tx("readwrite", function (s) { return s.put({ id: id, sr: 16000, pcm: a, at: Date.now() }); }).catch(function () {}); },
    putAudio16: function (id, int16, at) { return tx("readwrite", function (s) { return s.put({ id: id, sr: 16000, pcm: int16, at: at || Date.now() }); }); },
    audioIds: function () { return tx("readonly", function (s) { return s.getAllKeys(); }).catch(function () { return []; }); },
    allAudio: function () { return tx("readonly", function (s) { return s.getAll(); }).catch(function () { return []; }); },
    clearAudio: function () { return tx("readwrite", function (s) { return s.clear(); }); },
    b64: b64,
    read: read,
    KEYS: { speech: "ja-spike-s-v1", trace: "ja-trace-v1", media: "ja-media-result-v1", app: "ja-slice-v1" }
  };
})(window);
