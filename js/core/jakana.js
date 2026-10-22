/* Kurenai OS — core/jakana.js (KOS.jaKana)
   Kana tables, romaji → kana, script folding and mora splitting (docs/japanese-plan.md §7.1).
   Pure — no store, no DOM — so it runs in the page and in Node; tools/ja_valid_check.mjs holds it.
   Ported from the vertical slice (prototypes/japanese-space/kana.js). */
(function (G) {
  "use strict";
  var KOS = G.KOS = G.KOS || {};

  // romaji → hiragana. Longest match wins, so three-letter keys are tried before two and one.
  var R = {
    a: "あ", i: "い", u: "う", e: "え", o: "お",
    ka: "か", ki: "き", ku: "く", ke: "け", ko: "こ",
    sa: "さ", shi: "し", si: "し", su: "す", se: "せ", so: "そ",
    ta: "た", chi: "ち", ti: "ち", tsu: "つ", tu: "つ", te: "て", to: "と",
    na: "な", ni: "に", nu: "ぬ", ne: "ね", no: "の",
    ha: "は", hi: "ひ", fu: "ふ", hu: "ふ", he: "へ", ho: "ほ",
    ma: "ま", mi: "み", mu: "む", me: "め", mo: "も",
    ya: "や", yu: "ゆ", yo: "よ",
    ra: "ら", ri: "り", ru: "る", re: "れ", ro: "ろ",
    wa: "わ", wo: "を", nn: "ん", "n'": "ん",
    ga: "が", gi: "ぎ", gu: "ぐ", ge: "げ", go: "ご",
    za: "ざ", ji: "じ", zi: "じ", zu: "ず", ze: "ぜ", zo: "ぞ",
    da: "だ", di: "ぢ", du: "づ", de: "で", do: "ど",
    ba: "ば", bi: "び", bu: "ぶ", be: "べ", bo: "ぼ",
    pa: "ぱ", pi: "ぴ", pu: "ぷ", pe: "ぺ", po: "ぽ",
    xa: "ぁ", xi: "ぃ", xu: "ぅ", xe: "ぇ", xo: "ぉ", la: "ぁ", li: "ぃ", lu: "ぅ", le: "ぇ", lo: "ぉ",
    xya: "ゃ", xyu: "ゅ", xyo: "ょ", lya: "ゃ", lyu: "ゅ", lyo: "ょ", xtsu: "っ", xtu: "っ", ltu: "っ",
    sha: "しゃ", shu: "しゅ", sho: "しょ", she: "しぇ", sya: "しゃ", syu: "しゅ", syo: "しょ",
    cha: "ちゃ", chu: "ちゅ", cho: "ちょ", che: "ちぇ", tya: "ちゃ", tyu: "ちゅ", tyo: "ちょ",
    ja: "じゃ", ju: "じゅ", jo: "じょ", je: "じぇ", jya: "じゃ", jyu: "じゅ", jyo: "じょ", zya: "じゃ", zyu: "じゅ", zyo: "じょ",
    fa: "ふぁ", fi: "ふぃ", fe: "ふぇ", fo: "ふぉ", thi: "てぃ", dhi: "でぃ",
    "-": "ー"
  };
  ["k", "g", "n", "h", "b", "p", "m", "r"].forEach(function (c) {
    var base = R[c + "i"];
    R[c + "ya"] = base + "ゃ"; R[c + "yu"] = base + "ゅ"; R[c + "yo"] = base + "ょ";
  });
  var VOWEL = /[aiueo]/, CONS = /[bcdfghjklmpqrstvwxyz]/;

  /* toKana("taberu") → "たべる"; upper-case romaji gives katakana (the WanaKana convention).
     Characters that are not romaji pass through unchanged, so mixed input is safe. */
  function toKana(s) {
    var out = "", i = 0;
    while (i < s.length) {
      var ch = s[i], lo = ch.toLowerCase(), upper = ch !== lo;
      if (!/[a-z'\-]/.test(lo)) { out += ch; i++; continue; }
      // っ: a doubled consonant (not n)
      if (CONS.test(lo) && lo !== "n" && s[i + 1] && s[i + 1].toLowerCase() === lo) { out += upper ? "ッ" : "っ"; i++; continue; }
      // ん: n before a consonant (not y), before an apostrophe, or at the end
      if (lo === "n") {
        var nx = (s[i + 1] || "").toLowerCase();
        if (nx === "'") { out += upper ? "ン" : "ん"; i += 2; continue; }
        if (nx === "n") {
          // "konnichiwa": the second n starts に; "honn" at the end is one ん
          var nx2 = (s[i + 2] || "").toLowerCase();
          out += upper ? "ン" : "ん"; i += (VOWEL.test(nx2) || nx2 === "y") ? 1 : 2; continue;
        }
        if (!nx || (!VOWEL.test(nx) && nx !== "y")) { out += upper ? "ン" : "ん"; i++; continue; }
      }
      var hit = null;
      for (var len = 4; len >= 1; len--) {
        var key = s.substr(i, len).toLowerCase();
        if (R[key]) { hit = key; break; }
      }
      if (!hit) { out += ch; i++; continue; }
      out += upper ? toKatakana(R[hit]) : R[hit];
      i += hit.length;
    }
    return out;
  }

  function toKatakana(s) { return s.replace(/[ぁ-ゖ]/g, function (c) { return String.fromCharCode(c.charCodeAt(0) + 0x60); }); }
  function toHiragana(s) { return s.replace(/[ァ-ヶ]/g, function (c) { return String.fromCharCode(c.charCodeAt(0) - 0x60); }); }
  function isKana(s) { return /^[ぁ-ゖァ-ヺー]+$/.test(s); }
  function hasKanji(s) { return /[㐀-鿿々]/.test(s); }
  function hasRomaji(s) { return /[a-zA-Z]/.test(s); }

  /* Morae: small ゃゅょ and small vowels join the kana before them; っ, ん and ー are morae of their own. */
  var SMALL = /[ゃゅょぁぃぅぇぉゎャュョァィゥェォヮ]/;
  function morae(s) {
    var out = [];
    for (var i = 0; i < s.length; i++) {
      if (SMALL.test(s[i]) && out.length) out[out.length - 1] += s[i]; else out.push(s[i]);
    }
    return out;
  }

  // the vowel a mora ends in (for long-vowel diagnosis); ー takes the previous mora's
  var VOWELS = { a: "あかさたなはまやらわがざだばぱぁゃ", i: "いきしちにひみりぎじぢびぴぃ", u: "うくすつぬふむゆるぐずづぶぷぅゅ", e: "えけせてねへめれげぜでべぺぇ", o: "おこそとのほもよろをごぞどぼぽぉょ" };
  function vowelOf(m) {
    var last = toHiragana(m).slice(-1);
    for (var v in VOWELS) if (VOWELS[v].indexOf(last) >= 0) return v;
    return null;
  }

  // dakuten pairs for voicing diagnosis
  var VOICED = "かがきぎくぐけげこごさざしじすずせぜそぞただちぢつづてでとどはばひびふぶへべほぼ";
  function voicingPair(a, b) {
    a = toHiragana(a)[0]; b = toHiragana(b)[0];
    var ia = VOICED.indexOf(a), ib = VOICED.indexOf(b);
    if (ia < 0 || ib < 0) {
      var P = "はぱひぴふぷへぺほぽばぱびぴぶぷべぺぼぽ";
      var pa = P.indexOf(a), pb = P.indexOf(b);
      return pa >= 0 && pb >= 0 && pa >> 1 === pb >> 1 && a !== b;
    }
    return a !== b && (ia >> 1) === (ib >> 1);
  }

  KOS.jaKana = { toKana: toKana, toKatakana: toKatakana, toHiragana: toHiragana, isKana: isKana, hasKanji: hasKanji,
    hasRomaji: hasRomaji, morae: morae, vowelOf: vowelOf, voicingPair: voicingPair };

})(typeof window !== "undefined" ? window : globalThis);
