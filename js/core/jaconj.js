/* Conjugation engine: generates forms and diagnoses wrong ones (docs/japanese-plan.md §7.2).
   A verb is {dict:"食べる", kana:"たべる", cls:"ichidan"|"godan"|"suru"|"kuru", iku?:true, aru?:true}.
   Every form is returned as {surface, kana}: godan and ichidan change only kana at the end, so
   the same rule runs on both spellings. Pure, also in Node (tools/ja_valid_check.mjs).
   KOS.jaConj; KOS.jaVerbs is the engine's reference set (every class, every godan ending and the
   exceptions) that the golden tests run — lessons carry their own verbs. */
(function (G) {
  "use strict";
  var KOS = G.KOS = G.KOS || {};

  var ROW = { // godan final kana → [a, i, e, o] rows
    "う": ["わ", "い", "え", "お"], "く": ["か", "き", "け", "こ"], "ぐ": ["が", "ぎ", "げ", "ご"],
    "す": ["さ", "し", "せ", "そ"], "つ": ["た", "ち", "て", "と"], "ぬ": ["な", "に", "ね", "の"],
    "ぶ": ["ば", "び", "べ", "ぼ"], "む": ["ま", "み", "め", "も"], "る": ["ら", "り", "れ", "ろ"]
  };
  var TE = { "う": "って", "つ": "って", "る": "って", "む": "んで", "ぶ": "んで", "ぬ": "んで", "く": "いて", "ぐ": "いで", "す": "して" };

  var TARGETS = {
    dict: "dictionary form", masu: "polite present (ます)", masen: "polite negative (ません)",
    mashita: "polite past (ました)", masendeshita: "polite past negative (ませんでした)", mashou: "polite volitional (ましょう)",
    te: "て-form", ta: "plain past (た)", nai: "plain negative (ない)", nakatta: "plain past negative (なかった)", tai: "want to (たい)"
  };

  // stems by class; `f` is the spelling being conjugated (kanji or kana), all endings are kana
  function stems(f, cls, v) {
    var head = f.slice(0, -1), last = f.slice(-1);
    if (cls === "ichidan") return { i: head, a: head, te: head + "て", ta: head + "た" };
    if (cls === "godan") {
      var r = ROW[last]; if (!r) return null;
      var te = (v.iku && last === "く") ? "って" : TE[last];
      return { i: head + r[1], a: head + r[0], te: head + te, ta: head + te.replace("て", "た").replace("で", "だ") };
    }
    if (cls === "suru") { var b = f.slice(0, -2); return { i: b + "し", a: b + "し", te: b + "して", ta: b + "した" }; }
    if (cls === "kuru") {
      // 来る keeps its kanji; the kana changes: き (masu), こ (nai), き (te)
      var kanji = f.charAt(0) === "来";
      return { i: kanji ? "来" : "き", a: kanji ? "来" : "こ", te: kanji ? "来て" : "きて", ta: kanji ? "来た" : "きた" };
    }
    return null;
  }

  function formOf(f, cls, target, v) {
    var s = stems(f, cls, v); if (!s) return null;
    switch (target) {
      case "dict": return f;
      case "masu": return s.i + "ます";
      case "masen": return s.i + "ません";
      case "mashita": return s.i + "ました";
      case "masendeshita": return s.i + "ませんでした";
      case "mashou": return s.i + "ましょう";
      case "te": return s.te;
      case "ta": return s.ta;
      case "nai": return v.aru && cls === "godan" ? "ない" : s.a + "ない";
      case "nakatta": return v.aru && cls === "godan" ? "なかった" : s.a + "なかった";
      case "tai": return s.i + "たい";
    }
    return null;
  }

  function conj(v, target, cls) {
    cls = cls || v.cls;
    return { surface: formOf(v.dict, cls, target, v), kana: formOf(v.kana, cls, target, v) };
  }

  /* The forms a learner might produce by mistake, each with a diagnosis. Used by the validator's
     conjugation strategy to explain a wrong answer instead of only marking it. */
  function mistakes(v, target) {
    var out = [];
    var swap = v.cls === "ichidan" ? "godan" : v.cls === "godan" && /る$/.test(v.kana) ? "ichidan" : null;
    if (swap) {
      var w = conj(v, target, swap);
      if (w.kana && w.kana !== conj(v, target).kana)
        out.push({ form: w, code: "class", explain: v.cls === "godan"
          ? "You used the ichidan (る-drop) rule, but " + v.dict + " is a godan verb: " + v.dict + " → " + conj(v, target).surface + "."
          : "You used the godan rule, but " + v.dict + " is an ichidan verb: drop る → " + conj(v, target).surface + "." });
    }
    // te/ta without the sound change: 書く → 書きて
    if ((target === "te" || target === "ta") && v.cls === "godan") {
      var s = stems(v.kana, "godan", v), sf = stems(v.dict, "godan", v);
      var naive = { surface: sf.i + (target === "te" ? "て" : "た"), kana: s.i + (target === "te" ? "て" : "た") };
      out.push({ form: naive, code: "te-sound", explain: "The て/た form of a godan verb changes sound: " + v.kana.slice(-1) + " → " + TE[v.kana.slice(-1)] + " (" + v.dict + " → " + conj(v, target).surface + ")." });
      if (v.iku) out.push({ form: { surface: v.dict.slice(0, -1) + "い" + (target === "te" ? "て" : "た"), kana: v.kana.slice(0, -1) + "い" + (target === "te" ? "て" : "た") }, code: "iku", explain: "行く is the one exception: 行って / 行った, not 行いて." });
    }
    // う-verbs: negative takes わ, not あ
    if ((target === "nai" || target === "nakatta") && v.cls === "godan" && /う$/.test(v.kana)) {
      var tail = target === "nai" ? "ない" : "なかった";
      out.push({ form: { surface: v.dict.slice(0, -1) + "あ" + tail, kana: v.kana.slice(0, -1) + "あ" + tail }, code: "u-wa", explain: "Verbs ending in う take わ before ない: " + conj(v, target).surface + "." });
    }
    if ((target === "nai" || target === "nakatta") && v.aru) {
      var t2 = target === "nai" ? "ない" : "なかった";
      out.push({ form: { surface: "あら" + t2, kana: "あら" + t2 }, code: "aru", explain: "ある has no あら-form: its negative is simply ない." });
    }
    // another target entirely (masu instead of masen, …)
    Object.keys(TARGETS).forEach(function (t) {
      if (t === target) return;
      var f = conj(v, t);
      if (f.kana) out.push({ form: f, code: "target", target: t, explain: "That is the " + TARGETS[t] + "; this asks for the " + TARGETS[target] + "." });
    });
    return out;
  }

  KOS.jaConj = { conj: conj, mistakes: mistakes, TARGETS: TARGETS };

  // the reference set (~20): every class, every godan ending, and the exceptions
  KOS.jaVerbs = [
    { dict: "食べる", kana: "たべる", cls: "ichidan", en: "eat" },
    { dict: "見る", kana: "みる", cls: "ichidan", en: "see" },
    { dict: "起きる", kana: "おきる", cls: "ichidan", en: "get up" },
    { dict: "寝る", kana: "ねる", cls: "ichidan", en: "sleep" },
    { dict: "飲む", kana: "のむ", cls: "godan", en: "drink" },
    { dict: "読む", kana: "よむ", cls: "godan", en: "read" },
    { dict: "書く", kana: "かく", cls: "godan", en: "write" },
    { dict: "聞く", kana: "きく", cls: "godan", en: "listen" },
    { dict: "泳ぐ", kana: "およぐ", cls: "godan", en: "swim" },
    { dict: "話す", kana: "はなす", cls: "godan", en: "speak" },
    { dict: "待つ", kana: "まつ", cls: "godan", en: "wait" },
    { dict: "死ぬ", kana: "しぬ", cls: "godan", en: "die" },
    { dict: "遊ぶ", kana: "あそぶ", cls: "godan", en: "play" },
    { dict: "買う", kana: "かう", cls: "godan", en: "buy" },
    { dict: "会う", kana: "あう", cls: "godan", en: "meet" },
    { dict: "帰る", kana: "かえる", cls: "godan", en: "go home" },
    { dict: "分かる", kana: "わかる", cls: "godan", en: "understand" },
    { dict: "行く", kana: "いく", cls: "godan", iku: true, en: "go" },
    { dict: "ある", kana: "ある", cls: "godan", aru: true, en: "exist (things)" },
    { dict: "する", kana: "する", cls: "suru", en: "do" },
    { dict: "勉強する", kana: "べんきょうする", cls: "suru", en: "study" },
    { dict: "来る", kana: "くる", cls: "kuru", en: "come" }
  ];
})(typeof window !== "undefined" ? window : globalThis);
