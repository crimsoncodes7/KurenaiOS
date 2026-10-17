/* Acoustic checks on the device (docs/japanese-plan.md §13): speech recognisers "fix" a dropped
   long vowel or っ, so single words and sound contrasts are judged from the signal instead.
   Pure: PCM in, features out. Frames → energy + YIN pitch → silence / unvoiced / voiced labels →
   runs; each candidate reading predicts a timing pattern, and the nearest pattern wins. */
(function (G) {
  "use strict";
  var JA = G.JA = G.JA || {};
  var WIN = 512, HOP = 160; // at 16 kHz: 32 ms window, 10 ms hop

  /* YIN (de Cheveigné & Kawahara 2002): returns {f0, ap} where ap is the aperiodicity (lower = more voiced). */
  function yin(buf, sr) {
    var minT = Math.floor(sr / 450), maxT = Math.min(Math.floor(sr / 65), buf.length >> 1);
    var d = new Float32Array(maxT + 1), cm = new Float32Array(maxT + 1), W = buf.length - maxT;
    for (var t = 1; t <= maxT; t++) { var s = 0; for (var i = 0; i < W; i++) { var x = buf[i] - buf[i + t]; s += x * x; } d[t] = s; }
    cm[0] = 1; var run = 0;
    for (t = 1; t <= maxT; t++) { run += d[t]; cm[t] = run ? d[t] * t / run : 1; }
    for (t = minT; t <= maxT; t++) {
      if (cm[t] < 0.15) { while (t + 1 <= maxT && cm[t + 1] < cm[t]) t++;
        var a = cm[t - 1], b = cm[t], c = t + 1 <= maxT ? cm[t + 1] : b, den = a - 2 * b + c, sh = den ? (a - c) / (2 * den) : 0;
        return { f0: sr / (t + sh), ap: b }; }
    }
    var best = minT; for (t = minT; t <= maxT; t++) if (cm[t] < cm[best]) best = t;
    return { f0: sr / best, ap: cm[best] };
  }

  /* analyse(pcm, sr) → {frames: [{t, db, f0, ap, lab}], runs: [{lab, start, dur}], dur, contour}. lab: c (silence) | u | v */
  function analyse(pcm, sr) {
    var frames = [];
    for (var s = 0; s + WIN <= pcm.length; s += HOP) {
      var e = 0; for (var i = 0; i < WIN; i++) e += pcm[s + i] * pcm[s + i];
      var db = 10 * Math.log10(e / WIN + 1e-10);
      frames.push({ t: s / sr, db: db, seg: pcm.subarray(s, s + WIN) });
    }
    if (!frames.length) return { frames: [], runs: [], dur: 0, contour: [] };
    var sorted = frames.map(function (f) { return f.db; }).sort(function (a, b) { return a - b; });
    var floor = sorted[Math.floor(sorted.length * 0.1)], peak = sorted[sorted.length - 1];
    var thr = Math.max(floor + 12, peak - 38);
    frames.forEach(function (f) {
      if (f.db < thr) { f.lab = "c"; return; }
      var y = yin(f.seg, sr); f.f0 = y.f0; f.ap = y.ap;
      f.lab = y.ap < 0.25 && y.f0 > 70 && y.f0 < 450 ? "v" : "u";
    });
    // smooth: a single frame that disagrees with both neighbours takes theirs
    for (var k = 1; k < frames.length - 1; k++) if (frames[k - 1].lab === frames[k + 1].lab && frames[k].lab !== frames[k - 1].lab) frames[k].lab = frames[k - 1].lab;
    frames.forEach(function (f) { delete f.seg; });
    var a = 0, b = frames.length - 1;
    while (a < b && frames[a].lab === "c") a++;
    while (b > a && frames[b].lab === "c") b--;
    var runs = [], hop = HOP / sr;
    for (k = a; k <= b; k++) {
      var l = frames[k].lab, last = runs[runs.length - 1];
      if (last && last.lab === l) last.dur += hop; else runs.push({ lab: l, start: frames[k].t, dur: hop });
    }
    // a run shorter than 30 ms is absorbed into the run before it
    runs = runs.reduce(function (o, r) { var p = o[o.length - 1]; if (p && r.dur < 0.03) p.dur += r.dur; else if (p && p.lab === r.lab) p.dur += r.dur; else o.push(r); return o; }, []);
    var contour = frames.slice(a, b + 1).filter(function (f) { return f.lab === "v"; }).map(function (f) { return [f.t, f.f0]; });
    return { frames: frames, runs: runs, dur: runs.reduce(function (x, r) { return x + r.dur; }, 0), contour: contour };
  }

  // ---------- what a reading predicts ----------
  var UNV = { k: 1, s: 1, t: 1, h: 1, p: 1, f: 1 }, STOP = { k: 1, t: 1, p: 1 };
  // minimal kana → romaji for onsets (only the first letter matters here)
  var ON = { "か": "k", "き": "k", "く": "k", "け": "k", "こ": "k", "さ": "s", "し": "s", "す": "s", "せ": "s", "そ": "s", "た": "t", "ち": "t", "つ": "t", "て": "t", "と": "t",
    "は": "h", "ひ": "h", "ふ": "f", "へ": "h", "ほ": "h", "ぱ": "p", "ぴ": "p", "ぷ": "p", "ぺ": "p", "ぽ": "p" };
  var VOW = { "い": "i", "き": "i", "し": "i", "ち": "i", "ひ": "i", "ぴ": "i", "く": "u", "す": "u", "つ": "u", "ふ": "u", "ぷ": "u" };
  function toRomaji(m) { return ON[JA.kana.toHiragana(m)[0]] || ""; }

  /* predict(kana) → the timeline a careful speaker would produce, in mora units. */
  function predict(kana) {
    var ms = JA.kana.morae(JA.kana.toHiragana(kana)), segs = [];
    function push(lab, d) { var l = segs[segs.length - 1]; if (l && l.lab === lab) l.dur += d; else segs.push({ lab: lab, dur: d }); }
    ms.forEach(function (m, i) {
      var nextOn = ms[i + 1] ? toRomaji(ms[i + 1]) : "";
      if (m === "っ") { if (nextOn === "s" || nextOn === "h" || nextOn === "f") push("u", 1); else push("c", 1); return; }
      if (m === "ー" || m === "ん" || /^[あいうえおやゆよわをらりるれろまみむめもなにぬねのがぎぐげござじずぜぞだぢづでどばびぶべぼ]/.test(m)) { push("v", 1); return; }
      var on = toRomaji(m);
      if (on) {
        if (STOP[on] && i > 0) push("c", 0.18);
        push("u", STOP[on] ? 0.17 : 0.35);
        // high vowels between voiceless consonants (or at the end after one) are devoiced
        var dev = VOW[m[0]] && (UNV[nextOn] || (!ms[i + 1] && i > 0));
        push(dev ? "u" : "v", STOP[on] ? 0.65 : 0.65);
        return;
      }
      push("v", 1);
    });
    while (segs.length && segs[0].lab === "c") segs.shift();
    return segs;
  }

  function features(runs) {
    var D = runs.reduce(function (a, r) { return a + r.dur; }, 0) || 1;
    var c = 0, v = 0, nv = 0;
    runs.forEach(function (r) { if (r.lab === "c") c = Math.max(c, r.dur); if (r.lab === "v") { v = Math.max(v, r.dur); nv++; } });
    return { closure: c / D, voiced: v / D, runs: nv };
  }

  function vshares(runs) {
    var v = runs.filter(function (r) { return r.lab === "v"; }).map(function (r) { return r.dur; }), t = v.reduce(function (a, b) { return a + b; }, 0) || 1;
    return v.map(function (x) { return x / t; });
  }
  function units(segs) { return segs.reduce(function (a, r) { return a + r.dur; }, 0); }
  function maxRun(segs, lab) { return segs.reduce(function (m, r) { return r.lab === lab ? Math.max(m, r.dur) : m; }, 0); }

  /* calibrate(analysis, phrase) → seconds per mora for this speaker, this session. A long vowel
     cannot be told from a short one by proportions alone (いえ and いいえ are both all voice), so
     long-vowel decisions need the speaker's own rate. */
  var CALIBRATION = "ありがとうございます";
  function calibrate(an, phrase) { return an.dur / units(predict(phrase || CALIBRATION)); }

  /* decide(analysis, [kanaA, kanaB], {mora}) → {heard, scores, margin, confident, why}.
     Without a calibrated mora length it compares proportions (fine for っ); with one it compares
     absolute lengths — the word, its longest vowel and its longest silence — in morae. */
  function decide(an, cands, opts) {
    var mora = opts && opts.mora;
    var obs = features(an.runs);
    var scores = cands.map(function (k) {
      var segs = predict(k), p = features(segs);
      var sc = 2.2 * Math.abs(obs.closure - p.closure) + 1.0 * Math.abs(obs.voiced - p.voiced);
      if (mora) {
        var len = an.dur / mora, v = maxRun(an.runs, "v") / mora, c = maxRun(an.runs, "c") / mora;
        sc = Math.abs(Math.log(len / units(segs))) + Math.abs(Math.log((v + 0.3) / (maxRun(segs, "v") + 0.3))) + 0.6 * Math.abs(c - maxRun(segs, "c"));
      }
      // rate-free: the voiced stretches' shares of all voicing (おばあ|さん against おば|さん)
      var ov = vshares(an.runs), pv = vshares(segs);
      if (ov.length === pv.length && ov.length > 1) sc += 1.5 * ov.reduce(function (a, x, i) { return a + Math.abs(x - pv[i]); }, 0);
      return sc;
    });
    var best = scores[0] <= scores[1] ? 0 : 1;
    var margin = Math.abs(scores[0] - scores[1]);
    var pa = features(predict(cands[0])), pb = features(predict(cands[1]));
    var byClosure = Math.abs(pa.closure - pb.closure) > Math.abs(pa.voiced - pb.voiced);
    var why = byClosure ? "the held silence (っ) was " + Math.round(obs.closure * 100) + "% of the word"
      : mora ? "the word lasted " + (an.dur / mora).toFixed(1) + " beats at your pace" : "the longest vowel was " + Math.round(obs.voiced * 100) + "% of the word";
    var needsRate = !byClosure && !mora;
    return { pick: best, heard: cands[best], scores: scores, margin: margin, confident: !needsRate && margin > (mora ? 0.25 : 0.06), needsRate: needsRate, why: why, obs: obs };
  }

  /* Pitch contour in semitones around the speaker's median, for the advisory overlay. */
  function semitones(contour) {
    if (!contour.length) return [];
    var f = contour.map(function (p) { return p[1]; }).slice().sort(function (a, b) { return a - b; }), med = f[f.length >> 1];
    return contour.map(function (p) { return [p[0], 12 * Math.log2(p[1] / med)]; });
  }

  JA.acoustic = { analyse: analyse, predict: predict, features: features, decide: decide, calibrate: calibrate, CALIBRATION: CALIBRATION, semitones: semitones, yin: yin };
})(typeof window !== "undefined" ? window : globalThis);
