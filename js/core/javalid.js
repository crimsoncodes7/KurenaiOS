/* Answer validation: normalisation plus reusable strategies (docs/japanese-plan.md §7).
   Every strategy returns {verdict: "correct"|"accepted"|"near"|"wrong", note?, diagnosis?: {code, explain}, normalised}.
   Pure; runs in the page and in Node. KOS.jaValid; needs jakana.js and jaconj.js first (and
   jastroke.js for the `stroke` strategy). Invariant 114: every verdict is one of four; nothing here
   is AI-graded. */
(function (G) {
  "use strict";
  var KOS = G.KOS = G.KOS || {};
  var K = KOS.jaKana;

  /* 7.1 Normalisation: NFKC (full/half width), romaji → kana, punctuation and spaces out.
     opts.script: "hiragana" | "katakana" | "any" (fold katakana into hiragana unless the script is tested). */
  function normalise(s, opts) {
    opts = opts || {};
    var t = String(s == null ? "" : s).normalize("NFKC").trim();
    t = t.replace(/[\s　]+/g, "");
    if (K.hasRomaji(t)) t = K.toKana(opts.script === "katakana" ? t.toUpperCase() : t);
    t = t.replace(/[。．.、，,・!！?？「」『』"'()（）]/g, "").replace(/[〜～]/g, "ー");
    if (opts.script !== "katakana" && opts.fold !== false) t = K.toHiragana(t);
    return t;
  }

  function out(verdict, extra) { var r = { verdict: verdict }; for (var k in extra || {}) r[k] = extra[k]; return r; }

  /* mora-align: Levenshtein over morae, then name the slip. 0 edits → correct, 1 → near, else wrong. */
  function moraAlign(answer, target) {
    var a = K.morae(K.toHiragana(answer)), b = K.morae(K.toHiragana(target));
    var n = a.length, m = b.length, D = [];
    for (var i = 0; i <= n; i++) { D[i] = [i]; for (var j = 1; j <= m; j++) D[i][j] = i === 0 ? j : 0; }
    for (i = 1; i <= n; i++) for (j = 1; j <= m; j++)
      D[i][j] = Math.min(D[i - 1][j] + 1, D[i][j - 1] + 1, D[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    var ops = []; i = n; j = m;
    while (i > 0 || j > 0) {
      if (i > 0 && j > 0 && D[i][j] === D[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)) { if (a[i - 1] !== b[j - 1]) ops.push({ op: "sub", got: a[i - 1], want: b[j - 1], at: j - 1 }); i--; j--; }
      else if (j > 0 && D[i][j] === D[i][j - 1] + 1) { ops.push({ op: "del", want: b[j - 1], at: j - 1, prev: b[j - 2] }); j--; }
      else { ops.push({ op: "ins", got: a[i - 1], at: j, prev: a[i - 2] }); i--; }
    }
    ops.reverse();
    return { dist: D[n][m], ops: ops };
  }

  function isLongVowelMora(m, prev) {
    if (m === "ー") return true;
    if (!prev || !/^[あいうえお]$/.test(m)) return false;
    var v = K.vowelOf(prev);
    return v && (m === { a: "あ", i: "い", u: "う", e: "え", o: "お" }[v] || (v === "o" && m === "う") || (v === "e" && m === "い"));
  }

  function nameSlip(op) {
    if (op.op === "del" && op.want === "っ") return { code: "sokuon", explain: "The small っ (a held beat) is missing." };
    if (op.op === "ins" && op.got === "っ") return { code: "sokuon", explain: "There is a small っ (a held beat) that does not belong here." };
    if (op.op === "del" && isLongVowelMora(op.want, op.prev)) return { code: "long-vowel", explain: "A long vowel is missing: hold it for two beats (" + op.prev + op.want + ")." };
    if (op.op === "ins" && isLongVowelMora(op.got, op.prev)) return { code: "long-vowel", explain: "The vowel is held too long: it is one beat here." };
    if (op.op === "sub" && K.voicingPair(op.got, op.want)) return { code: "voicing", explain: "Voicing: " + op.want + ", not " + op.got + " (check the ゛ marks)." };
    if (op.op === "sub" && op.got.length !== op.want.length && op.got[0] === op.want[0]) return { code: "yoon", explain: "Small ゃゅょ: " + op.want + ", not " + op.got + "." };
    return { code: "mora", explain: op.op === "sub" ? op.want + ", not " + op.got + "." : op.op === "del" ? "Missing " + op.want + "." : "Extra " + op.got + "." };
  }

  /* compare two kana strings: {dist, diagnosis}. A big や/ゆ/よ for a small one is one slip. */
  var BIG = { "ゃ": "や", "ゅ": "ゆ", "ょ": "よ", "ャ": "ヤ", "ュ": "ユ", "ョ": "ヨ" };
  /* ー spells the same long vowel as a kana: コーコー is こうこう, ケーキ is けえき (お-row → う, え-row → い
     as the usual spellings; the other spelling is folded too so おお and えい words still match). */
  var LONG = { a: "あ", i: "い", u: "う", e: "い", o: "う" };
  function longFold(s) {
    var out = "";
    for (var i = 0; i < s.length; i++) {
      var c = s[i];
      if (c === "ー" && out) { var v = K.vowelOf(out[out.length - 1]); out += v ? LONG[v] : c; continue; }
      if ((c === "お" || c === "え") && out && K.vowelOf(out[out.length - 1]) === (c === "お" ? "o" : "e")) { out += c === "お" ? "う" : "い"; continue; }
      out += c;
    }
    return out;
  }
  function compareKana(a, t) {
    if (a === t) return { dist: 0 };
    var fa = longFold(a), ft = longFold(t);
    if (fa === ft) return { dist: 0 };
    a = fa; t = ft;
    var big = function (x) { return x.replace(/[ゃゅょャュョ]/g, function (c) { return BIG[c]; }); };
    if (big(a) === big(t)) return { dist: 1, diagnosis: { code: "yoon", explain: "Small ゃゅょ: " + t + " is one beat per small-kana pair (" + K.morae(t).filter(function (m) { return m.length > 1; }).join(", ") + ")." } };
    var al = moraAlign(a, t);
    return { dist: al.dist, diagnosis: al.ops.length ? nameSlip(al.ops[0]) : null };
  }

  /* exact-kana: kana drills. The script is enforced when it is what is being tested. */
  function exactKana(input, ex) {
    var script = ex.script || "hiragana";
    var a = normalise(input, { script: script, fold: false });
    if (a === ex.target) return out("correct", { normalised: a });
    if (K.toHiragana(a) === K.toHiragana(ex.target))
      return out("near", { normalised: a, diagnosis: { code: "script", explain: "Right sound, wrong script: this asks for " + script + " (" + ex.target + ")." } });
    var c = compareKana(a, ex.target);
    if (c.dist === 1 && K.morae(ex.target).length > 1) return out("near", { normalised: a, diagnosis: c.diagnosis });
    return out("wrong", { normalised: a });
  }

  /* reading-set: any written form of the target word. forms: [{w:"食べる", r:"たべる"}], taught: "食べる". */
  function readingSet(input, ex) {
    var raw = String(input).normalize("NFKC").replace(/\s+/g, "");
    var a = normalise(input);
    var taught = ex.taught || ex.forms[0].w;
    for (var i = 0; i < ex.forms.length; i++) {
      var f = ex.forms[i];
      if (raw === f.w || a === K.toHiragana(f.w)) return out(f.w === taught ? "correct" : "accepted", { normalised: f.w, note: f.w === taught ? null : "Also right. The form taught here is " + taught + "." });
    }
    var reading = ex.forms[0].r;
    if (a === reading) {
      if (K.hasKanji(taught)) return out("accepted", { normalised: a, note: "Right word, written in kana. You learned it as " + taught + "." });
      return out("correct", { normalised: a });
    }
    if (K.isKana(a)) {
      var c = compareKana(a, reading);
      if (c.dist === 1) return out("near", { normalised: a, diagnosis: c.diagnosis || { code: "mora", explain: "Close: " + reading + "." } });
    }
    return out("wrong", { normalised: a });
  }

  /* meaning-set: English glosses. Articles, "to " before verbs, a final plural s and punctuation are ignored. */
  function en(s) {
    return String(s).toLowerCase().replace(/[.,!?;:"'()]/g, " ").replace(/\b(a|an|the)\b/g, " ").replace(/^\s*to\s+/, "")
      .replace(/\s+/g, " ").trim().replace(/(\w{3,})s\b/g, "$1");
  }
  function lev(a, b) {
    var D = []; for (var i = 0; i <= a.length; i++) { D[i] = [i]; }
    for (var j = 0; j <= b.length; j++) D[0][j] = j;
    for (i = 1; i <= a.length; i++) for (j = 1; j <= b.length; j++) D[i][j] = Math.min(D[i - 1][j] + 1, D[i][j - 1] + 1, D[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    return D[a.length][b.length];
  }
  function meaningSet(input, ex) {
    var a = en(input);
    if (!a) return out("wrong", { normalised: a });
    var gl = ex.glosses.map(en);
    if (gl.indexOf(a) >= 0) return out("correct", { normalised: a });
    for (var i = 0; i < gl.length; i++) if (gl[i].length >= 5 && lev(a, gl[i]) === 1) return out("near", { normalised: a, diagnosis: { code: "spelling", explain: "Check the spelling: " + ex.glosses[i] + "." } });
    return out("wrong", { normalised: a });
  }

  /* conjugation: compare with the generated form; a wrong answer is matched against likely mistakes. */
  function conjugation(input, ex) {
    var v = ex.verb, want = KOS.jaConj.conj(v, ex.target);
    var raw = String(input).normalize("NFKC").replace(/\s+/g, "");
    var a = normalise(input);
    if (raw === want.surface || a === K.toHiragana(want.surface)) return out("correct", { normalised: want.surface });
    if (a === want.kana) return K.hasKanji(want.surface)
      ? out("accepted", { normalised: a, note: "Right form, in kana. With the kanji: " + want.surface + "." })
      : out("correct", { normalised: a });
    var ms = KOS.jaConj.mistakes(v, ex.target);
    for (var i = 0; i < ms.length; i++) {
      var f = ms[i].form;
      if (raw === f.surface || a === f.kana || a === K.toHiragana(f.surface || ""))
        return out("wrong", { normalised: a, diagnosis: { code: ms[i].code, explain: ms[i].explain } });
    }
    var c = compareKana(a, want.kana);
    if (c.dist === 1) return out("near", { normalised: a, diagnosis: c.diagnosis || { code: "mora", explain: "Close: " + want.surface + "." } });
    return out("wrong", { normalised: a, diagnosis: { code: "form", explain: v.dict + " → " + want.surface + "." } });
  }

  /* particle-slot: authored acceptable particles with reasons. Typed "wa"/"e"/"o" is the sound, not the spelling. */
  var SPELL = { "わ": "は", "え": "へ", "お": "を" };
  function particleSlot(input, ex) {
    var a = normalise(input);
    if (a === ex.target) return out("correct", { normalised: a });
    if (ex.accept && Object.prototype.hasOwnProperty.call(ex.accept, a)) return out("accepted", { normalised: a, note: ex.accept[a] });
    if (SPELL[a] && (SPELL[a] === ex.target || (ex.accept && ex.accept[SPELL[a]] !== undefined)))
      return out("near", { normalised: a, diagnosis: { code: "particle-spelling", explain: "Said “" + a + "” but written " + SPELL[a] + " when it is a particle." } });
    if (ex.wrong && ex.wrong[a]) return out("wrong", { normalised: a, diagnosis: { code: "particle", explain: ex.wrong[a] } });
    return out("wrong", { normalised: a });
  }

  /* order-graph: chunks with ordering constraints. ex.before: [[a, b, why]], ex.last: id, ex.natural: [ids]. */
  function orderGraph(order, ex) {
    var pos = {}; order.forEach(function (id, i) { pos[id] = i; });
    var missing = ex.chunks.filter(function (c) { return !(c.id in pos); });
    if (missing.length) return out("wrong", { diagnosis: { code: "missing", explain: "Use every tile." } });
    if (ex.last && pos[ex.last] !== order.length - 1) return out("wrong", { diagnosis: { code: "verb-final", explain: ex.lastWhy || "The verb (or です) comes last in a Japanese sentence." } });
    for (var i = 0; i < (ex.before || []).length; i++) {
      var r = ex.before[i];
      if (pos[r[0]] > pos[r[1]]) return out("wrong", { diagnosis: { code: "order", explain: r[2] } });
    }
    var text = function (ids) { return ids.map(function (id) { return ex.chunks.filter(function (c) { return c.id === id; })[0].t; }).join(""); };
    if (order.join() === ex.natural.join()) return out("correct", { normalised: text(order) });
    return out("accepted", { normalised: text(order), note: "Grammatical. More natural: " + text(ex.natural) + "." });
  }

  /* Dictation and spoken transcripts: mora alignment against any accepted reading. */
  function dictation(input, ex) {
    var a = normalise(input);
    var targets = [ex.target].concat(ex.alt || []).map(function (t) { return K.toHiragana(t); });
    if (targets.indexOf(a) >= 0) return out("correct", { normalised: a });
    var best = null;
    targets.forEach(function (t) { var c = compareKana(a, t); if (!best || c.dist < best.dist) best = c; });
    if (best.dist === 0) return out("correct", { normalised: a });
    if (best.dist === 1) return out("near", { normalised: a, diagnosis: best.diagnosis });
    return out("wrong", { normalised: a, diagnosis: best.diagnosis });
  }

  var STRATEGIES = { "exact-kana": exactKana, "reading-set": readingSet, "meaning-set": meaningSet, "conjugation": conjugation,
    "particle-slot": particleSlot, "order-graph": orderGraph, "dictation": dictation, "mora-align": dictation,
    // handwriting: input is the strokes, checked against KanjiVG (jastroke.js)
    "stroke": function (strokes, ex) { return KOS.jaStroke.check(ex.target, strokes); } };

  function check(strategy, input, ex) {
    var f = STRATEGIES[strategy];
    if (!f) throw new Error("No validation strategy " + strategy);
    var r = f(input, ex);
    if (r.diagnosis === null) delete r.diagnosis;
    return r;
  }

  KOS.jaValid = { check: check, normalise: normalise, moraAlign: moraAlign, STRATEGIES: Object.keys(STRATEGIES) };
})(typeof window !== "undefined" ? window : globalThis);
