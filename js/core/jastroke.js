/* Handwriting checks against KanjiVG strokes (docs/japanese-plan.md §7.2, the `stroke` strategy).
   Pure (no DOM): parses KanjiVG path data, samples it, and compares the learner's strokes in the
   same 109 × 109 space — count, order, direction and shape — with a diagnosis per stroke. */
(function (G) {
  "use strict";
  var KOS = G.KOS = G.KOS || {};
  var N = 32; // points per resampled stroke

  // ---------- path data → points (M m C c S s L l H h V v Z, all KanjiVG uses) ----------
  function parse(d) {
    var toks = d.match(/[MmCcSsLlHhVvZz]|-?\d*\.?\d+(?:e-?\d+)?/g) || [], i = 0, cmd = null;
    var x = 0, y = 0, sx = 0, sy = 0, lc = null, pts = [];
    function num() { return parseFloat(toks[i++]); }
    function cubic(x1, y1, x2, y2, x3, y3) {
      for (var t = 1; t <= 12; t++) {
        var u = t / 12, a = (1 - u) * (1 - u) * (1 - u), b = 3 * (1 - u) * (1 - u) * u, c = 3 * (1 - u) * u * u, e = u * u * u;
        pts.push([a * x + b * x1 + c * x2 + e * x3, a * y + b * y1 + c * y2 + e * y3]);
      }
      lc = [x2, y2]; x = x3; y = y3;
    }
    while (i < toks.length) {
      if (/[A-Za-z]/.test(toks[i])) cmd = toks[i++];
      var rel = cmd === cmd.toLowerCase(), ox = rel ? x : 0, oy = rel ? y : 0;
      switch (cmd.toUpperCase()) {
        case "M": x = num() + ox; y = num() + oy; sx = x; sy = y; pts.push([x, y]); lc = null; cmd = rel ? "l" : "L"; break;
        case "L": x = num() + ox; y = num() + oy; pts.push([x, y]); lc = null; break;
        case "H": x = num() + ox; pts.push([x, y]); lc = null; break;
        case "V": y = num() + oy; pts.push([x, y]); lc = null; break;
        case "C": cubic(num() + ox, num() + oy, num() + ox, num() + oy, num() + ox, num() + oy); break;
        case "S": var rx = lc ? 2 * x - lc[0] : x, ry = lc ? 2 * y - lc[1] : y; cubic(rx, ry, num() + ox, num() + oy, num() + ox, num() + oy); break;
        case "Z": x = sx; y = sy; pts.push([x, y]); break;
        default: i++;
      }
    }
    return pts;
  }

  function length(p) { var L = 0; for (var i = 1; i < p.length; i++) L += Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]); return L; }
  function resample(p, n) {
    n = n || N;
    if (p.length < 2) return Array.apply(null, Array(n)).map(function () { return p[0] ? p[0].slice() : [0, 0]; });
    var L = length(p), step = L / (n - 1), out = [p[0].slice()], acc = 0, prev = p[0];
    for (var i = 1; i < p.length && out.length < n; i++) {
      var cur = p[i], d = Math.hypot(cur[0] - prev[0], cur[1] - prev[1]);
      while (acc + d >= step && out.length < n && d > 0) {
        var t = (step - acc) / d, q = [prev[0] + t * (cur[0] - prev[0]), prev[1] + t * (cur[1] - prev[1])];
        out.push(q); prev = q; d = Math.hypot(cur[0] - prev[0], cur[1] - prev[1]); acc = 0;
      }
      acc += d; prev = cur;
    }
    while (out.length < n) out.push(p[p.length - 1].slice());
    return out;
  }
  function meanDist(a, b) { var s = 0; for (var i = 0; i < a.length; i++) s += Math.hypot(a[i][0] - b[i][0], a[i][1] - b[i][1]); return s / a.length; }

  var cache = {};
  function reference(ch) {
    if (cache[ch]) return cache[ch];
    var paths = KOS.jaStrokes && KOS.jaStrokes[ch];
    if (!paths) return null;
    return (cache[ch] = paths.map(function (d) { return resample(parse(d)); }));
  }

  /* check(ch, strokes) → {verdict, diagnosis?, perStroke: [{ok, issue}]}.
     strokes: arrays of [x, y] in KanjiVG's 109 × 109 box. Tolerances in box units. */
  var OK = 13, OFF = 24;
  function check(ch, strokes) {
    var ref = reference(ch);
    if (!ref) return { verdict: "wrong", diagnosis: { code: "no-reference", explain: "No stroke data for " + ch + "." } };
    var user = strokes.filter(function (s) { return s.length > 1 && length(s) > 3; }).map(function (s) { return resample(s); });
    var per = [];
    if (user.length !== ref.length) {
      var explain = ch + " has " + ref.length + " stroke" + (ref.length > 1 ? "s" : "") + "; you drew " + user.length + ".";
      // a stroke gone over twice (a second pass without Undo) is the commonest extra stroke
      if (user.length > ref.length) {
        var seen = {};
        for (var u = 0; u < user.length; u++) {
          var bj = 0, bd = Infinity;
          for (var r = 0; r < ref.length; r++) { var dd = Math.min(meanDist(user[u], ref[r]), meanDist(user[u].slice().reverse(), ref[r])); if (dd < bd) { bd = dd; bj = r; } }
          if (bd < OFF * 1.5 && seen[bj]) { explain = "You went over stroke " + (bj + 1) + " twice — Undo the extra one. " + explain; break; }
          if (bd < OFF * 1.5) seen[bj] = 1;
        }
      }
      return { verdict: "wrong", perStroke: per, diagnosis: { code: "count", explain: explain } };
    }

    var issues = [];
    for (var i = 0; i < ref.length; i++) {
      var fwd = meanDist(user[i], ref[i]), rev = meanDist(user[i].slice().reverse(), ref[i]);
      // the reference stroke this one looks most like (for order mistakes)
      // either way round: a stroke both moved AND drawn backwards is still an order mistake, not "shape"
      var back = user[i].slice().reverse(), best = i, bestD = Math.min(fwd, rev), bestRev = rev < fwd;
      for (var j = 0; j < ref.length; j++) {
        var dj = meanDist(user[i], ref[j]), rj = meanDist(back, ref[j]), m = Math.min(dj, rj);
        if (m < bestD - 4) { best = j; bestD = m; bestRev = rj < dj; }
      }
      var issue = null;
      if (best !== i && bestD < OK && Math.min(fwd, rev) > OK) issue = { code: "order", explain: "Your stroke " + (i + 1) + " is stroke " + (best + 1) + " of " + ch + ": stroke " + (Math.min(i, best) + 1) + " comes first" + (bestRev ? ", and it goes the other way: " + dirWord(ref[best]) : "") + "." };
      // reversed: the backwards stroke fits far better; judged against the stroke's own length so short strokes count too
      else if (rev < OK && rev < fwd * 0.6 && fwd > Math.min(OFF, Math.max(7, 0.25 * length(ref[i])))) issue = { code: "direction", explain: "Stroke " + (i + 1) + " goes the other way: " + dirWord(ref[i]) + "." };
      else if (fwd > OFF) issue = { code: "shape", explain: "Stroke " + (i + 1) + " is out of place or the wrong shape." };
      else if (fwd > OK) issue = { code: "rough", explain: "Stroke " + (i + 1) + " is a little off; compare it with the model." };
      per.push({ ok: !issue || issue.code === "rough", issue: issue, dist: Math.round(fwd * 10) / 10 });
      if (issue) issues.push(issue);
    }
    var hard = issues.filter(function (x) { return x.code !== "rough"; });
    if (!issues.length) return { verdict: "correct", perStroke: per };
    if (!hard.length) return { verdict: "accepted", perStroke: per, note: issues[0].explain };
    // order or direction with the right shapes is a slip worth one retry; a wrong shape is not
    var near = hard.every(function (x) { return x.code === "order" || x.code === "direction"; }) && hard.length <= 2;
    return { verdict: near ? "near" : "wrong", perStroke: per, diagnosis: hard[0] };
  }
  function dirWord(s) {
    var dx = s[s.length - 1][0] - s[0][0], dy = s[s.length - 1][1] - s[0][1];
    return Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "left to right" : "right to left") : (dy > 0 ? "top to bottom" : "bottom to top");
  }

  KOS.jaStroke = { parse: parse, resample: resample, reference: reference, check: check, length: length };
})(typeof window !== "undefined" ? window : globalThis);
