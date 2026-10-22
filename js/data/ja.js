/* Kurenai OS — data/ja.js (KOS_JA)
   The Japanese curriculum's spine (roadmap 5.5, docs/japanese-plan.md §3–§4). AUTHORED, like
   Code's; released one stage or unit at a time. This release: Stage 0, the kana.

   KOS_JA = {
     STAGES:      [{ id, kanji, name, units: [{ id, name, lessons: [lessonId], checkpoint }] }]
     LESSONS:     { id: { id, unit, title, items: [itemKey], produce: [itemKey] } }
     ITEMS:       { key: { key, kind, w, r, script?, row? } }   k:<kana> · s:<contrast>
     CHECKPOINTS: { id: { id, unit, title, skills: [...], gate? } }
   }
   Lesson notes, mnemonics and exercises live in js/data/content/ja-*.js (KOS_CONTENT["ja:<id>"]).
   The subject goes live in the app (KOS_DATA.ja, the spine every Study surface reads) only with
   the pages. */
(function () {
  "use strict";

  // ---- the kana, row by row: [kana, romaji] ----
  var H = {
    a: "あa いi うu えe おo", ka: "かka きki くku けke こko", sa: "さsa しshi すsu せse そso",
    ta: "たta ちchi つtsu てte とto", na: "なna にni ぬnu ねne のno", ha: "はha ひhi ふfu へhe ほho",
    ma: "まma みmi むmu めme もmo", ya: "やya ゆyu よyo", ra: "らra りri るru れre ろro", wa: "わwa をwo んn",
    ga: "がga ぎgi ぐgu げge ごgo", za: "ざza じji ずzu ぜze ぞzo", da: "だda ぢji づzu でde どdo",
    ba: "ばba びbi ぶbu べbe ぼbo", pa: "ぱpa ぴpi ぷpu ぺpe ぽpo",
    yoon: "きゃkya きゅkyu きょkyo しゃsha しゅshu しょsho ちゃcha ちゅchu ちょcho にゃnya にゅnyu にょnyo ひゃhya ひゅhyu ひょhyo みゃmya みゅmyu みょmyo りゃrya りゅryu りょryo ぎゃgya ぎゅgyu ぎょgyo じゃja じゅju じょjo びゃbya びゅbyu びょbyo ぴゃpya ぴゅpyu ぴょpyo",
    small: "っ(pause) ぁa ぃi ぅu ぇe ぉo ゃya ゅyu ょyo"
  };
  var toKata = function (s) { return s.replace(/[ぁ-ゖ]/g, function (c) { return String.fromCharCode(c.charCodeAt(0) + 0x60); }); };
  var K = {};
  Object.keys(H).forEach(function (row) { K[row] = toKata(H[row]); });
  K.ext = "ーlong ヴvu ティti ディdi ファfa フィfi フェfe フォfo ウィwi ウェwe ウォwo シェshe ジェje チェche トゥtu ドゥdu";

  var ITEMS = {}, LESSONS = {};
  function pairs(row) { return row.split(" ").map(function (p) { var m = /^([^\x00-\x7f(]+)\(?([^)]*)\)?$/.exec(p); return [m[1], m[2]]; }); }
  function addRow(script, rowName, row) {
    return pairs(row).map(function (p) {
      var key = "k:" + p[0];
      ITEMS[key] = { key: key, kind: "kana", w: p[0], r: p[1], script: script, row: rowName };
      return key;
    });
  }
  function lesson(id, unit, title, rows, script, extra) {
    var items = [];
    rows.forEach(function (r) { items = items.concat(addRow(script, r, (script === "hiragana" ? H : K)[r])); });
    if (extra) items = items.concat(extra);
    // every single kana is written (W, handwriting); a combined kana is read only (KOS.jaSrs)
    LESSONS[id] = { id: id, unit: unit, title: title, items: items, produce: items.filter(function (k) { return k.length === 3; }) };
    return id;
  }
  // sound contrasts the kana stage teaches by ear (listening minimal pairs; §13)
  ITEMS["s:sokuon"] = { key: "s:sokuon", kind: "sound", w: "っ", r: "a held pause", pairs: [["きて", "きって"], ["かこ", "かっこ"], ["さか", "さっか"]] };
  ITEMS["s:long"] = { key: "s:long", kind: "sound", w: "long vowels", r: "a held vowel", pairs: [["おばさん", "おばあさん"], ["ここ", "こうこう"], ["いえ", "いいえ"], ["ケキ", "ケーキ"]] };
  ITEMS["s:voicing"] = { key: "s:voicing", kind: "sound", w: "゛", r: "voicing", pairs: [["かき", "かぎ"], ["てんき", "でんき"], ["ふた", "ぶた"]] };

  var hira = [
    lesson("H1", "H", "あ and か rows", ["a", "ka"], "hiragana"),
    lesson("H2", "H", "さ and た rows", ["sa", "ta"], "hiragana"),
    lesson("H3", "H", "な and は rows", ["na", "ha"], "hiragana"),
    lesson("H4", "H", "ま, や and ら rows", ["ma", "ya", "ra"], "hiragana"),
    lesson("H5", "H", "わ, を and ん", ["wa"], "hiragana"),
    lesson("H6", "H", "Voiced sounds: ゛ and ゜", ["ga", "za", "da", "ba", "pa"], "hiragana", ["s:voicing"]),
    lesson("H7", "H", "Combined sounds: きゃ, しゅ, ちょ…", ["yoon"], "hiragana"),
    lesson("H8", "H", "Small っ, small kana and long vowels", ["small"], "hiragana", ["s:sokuon", "s:long"])
  ];
  var kata = [
    lesson("K1", "K", "ア and カ rows", ["a", "ka"], "katakana"),
    lesson("K2", "K", "サ and タ rows", ["sa", "ta"], "katakana"),
    lesson("K3", "K", "ナ and ハ rows", ["na", "ha"], "katakana"),
    lesson("K4", "K", "マ, ヤ and ラ rows", ["ma", "ya", "ra"], "katakana"),
    lesson("K5", "K", "ワ, ヲ and ン", ["wa"], "katakana"),
    lesson("K6", "K", "Voiced sounds in katakana", ["ga", "za", "da", "ba", "pa"], "katakana"),
    lesson("K7", "K", "Combined sounds in katakana", ["yoon"], "katakana"),
    lesson("K8", "K", "ー, small kana and sounds for loanwords", ["small", "ext"], "katakana")
  ];

  var STAGES = [
      { id: "s0", kanji: "仮", name: "Kana", units: [
        { id: "H", name: "Hiragana", lessons: hira, checkpoint: "cp-H" },
        { id: "K", name: "Katakana", lessons: kata, checkpoint: "cp-K" }] },
      { id: "s1", kanji: "基", name: "Foundations", units: [] },
      { id: "s2", kanji: "橋", name: "Bridge", units: [] },
      { id: "s3", kanji: "中", name: "Intermediate", units: [] },
      { id: "s4", kanji: "上", name: "Upper intermediate", units: [] },
      { id: "s5", kanji: "達", name: "Advanced", units: [] }
  ];
  var CHECKPOINTS = {
      "cp-H": { id: "cp-H", unit: "H", title: "Hiragana checkpoint", skills: ["R", "W", "L"] },
      "cp-K": { id: "cp-K", unit: "K", title: "Katakana checkpoint", skills: ["R", "W", "L"] }
  };

  window.KOS_JA = { STAGES: STAGES, LESSONS: LESSONS, ITEMS: ITEMS, CHECKPOINTS: CHECKPOINTS };

  /* the spine every Study surface reads (units → lessons), like KOS_DATA.code. Loading it is what
     makes Japanese a live subject (invariant 112). */
  window.KOS_DATA = window.KOS_DATA || {};
  // the lesson's one-line can-do (§3): what the leaf shows where a subject shows its specification
  function canDo(l) {
    var kana = l.items.filter(function (k) { return k.indexOf("k:") === 0; }).map(function (k) { return k.slice(2); });
    return (l.produce.length >= kana.length ? "Read and write " : "Read ") + (kana.length > 12 ? kana.length + " kana" : kana.join(" ")) + " by sight and by ear.";
  }
  window.KOS_DATA.ja = {
    id: "ja", name: "Japanese", board: "Kana to native media",
    labelL: "What this lesson teaches", labelR: "Where it leads",
    sections: [].concat.apply([], STAGES.map(function (st, si) {
      return st.units.map(function (u) {
        return { ref: u.id, title: u.name, stage: si, kanji: st.kanji,
          children: u.lessons.map(function (id) { return { ref: id, title: LESSONS[id].title, content: [canDo(LESSONS[id])] }; }) };
      });
    }))
  };
})();
