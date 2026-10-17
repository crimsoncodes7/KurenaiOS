/* The slice's content: Stage 0 kana あ–そ and lesson 1.1 これ・それ・あれ (docs/japanese-plan.md §16).
   Ruby markup: {本|ほん}. Every item key follows §4.1 (k: kana, w: word, j: kanji, g: grammar).
   Word keys use a slug here; the real space uses JMdict sequence numbers. Throwaway slice code. */
(function (G) {
  "use strict";
  var JA = G.JA = G.JA || {};

  var items = {};
  function add(k, o) { o.key = k; items[k] = o; }

  // ---------- Stage 0 · kana あ to そ ----------
  var KANA_HINT = {
    "あ": "An apple with a stalk: “a” for apple.", "い": "Two eels side by side: “i” for eel.", "う": "Someone bending over with a sore stomach: “u”.",
    "え": "An exotic bird with a long neck: “e”.", "お": "A UFO with a dot beside it: “o”.",
    "か": "A cutting blade beside a mosquito: “ka”.", "き": "A key with two teeth: “ki”.", "く": "A cuckoo's open beak: “ku”.",
    "け": "A keg on its side: “ke”.", "こ": "Two koi swimming: “ko”.",
    "さ": "A samurai's topknot and blade: “sa”.", "し": "A fish hook — she fishes: “shi”.", "す": "A swing on a rope: “su”.",
    "せ": "A shelf with one bent leg: “se” for set it down.", "そ": "A zigzag thread being sewn: “so”."
  };
  JA.kanaSet.forEach(function (p) { add("k:" + p[0], { kind: "kana", w: p[0], r: p[0], romaji: p[1], hint: KANA_HINT[p[0]] }); });

  // ---------- Lesson 1.1 · これ・それ・あれ ----------
  var words = [
    ["kore", "これ", "これ", ["this", "this one"], "near me (the speaker)", true],
    ["sore", "それ", "それ", ["that", "that one"], "near you (the listener)", true],
    ["are", "あれ", "あれ", ["that over there", "that", "that one over there"], "far from both of us", true],
    ["dore", "どれ", "どれ", ["which", "which one"], "the question word for これ/それ/あれ", false],
    ["hon", "本", "ほん", ["book"], "", true],
    ["pen", "ペン", "ぺん", ["pen"], "katakana: a loanword", false],
    ["kasa", "かさ", "かさ", ["umbrella"], "often written 傘", false],
    ["keeki", "ケーキ", "けーき", ["cake"], "katakana: a loanword; ー holds the vowel", true],
    ["neko", "ねこ", "ねこ", ["cat"], "often written 猫", false],
    ["nan", "なん", "なん", ["what"], "なん before です; also written 何", true]
  ];
  words.forEach(function (w) { add("w:" + w[0], { kind: "word", w: w[1], r: w[2], en: w[3], note: w[4], prod: w[5] }); });
  add("j:本", { kind: "kanji", w: "本", r: "ほん", en: ["book", "origin"], note: "A tree 木 with a line marking its root: the origin, and a book." });

  // the production set: these words also get writing and speaking facets (plan §8)
  JA.produces = function (item) { return !!(items[item] && items[item].prod); };

  // sentences with audio (spoken by the browser's Japanese voice in the slice; VOICEVOX later)
  JA.sentences = [
    { id: "s1", ja: "これは{本|ほん}です。", kana: "これはほんです", en: "This is a book." },
    { id: "s2", ja: "それはペンです。", kana: "それはぺんです", en: "That (near you) is a pen." },
    { id: "s3", ja: "あれはねこです。", kana: "あれはねこです", en: "That (over there) is a cat." },
    { id: "s4", ja: "これはなんですか。", kana: "これはなんですか", en: "What is this?" },
    { id: "s5", ja: "それはケーキです。", kana: "それはけーきです", en: "That is cake." },
    { id: "s6", ja: "あれはかさですか。", kana: "あれはかさですか", en: "Is that (over there) an umbrella?" },
    { id: "s7", ja: "はい、かさです。", kana: "はいかさです", en: "Yes, it is an umbrella." },
    { id: "s8", ja: "これもケーキですか。", kana: "これもけーきですか", en: "Is this cake too?" }
  ];

  // grammar points and their exercise templates
  add("g:wa-desu", { kind: "grammar", w: "〜は〜です", en: ["X is Y"], note: "は marks the topic; です ends a polite statement." });
  add("g:kosoa", { kind: "grammar", w: "これ・それ・あれ", en: ["this / that / that over there"], note: "Chosen by distance from the speaker and the listener." });
  add("g:ka", { kind: "grammar", w: "〜ですか", en: ["question"], note: "か at the end makes a question. No question mark is needed." });

  // build-sentence templates (order-graph) for g:wa-desu and g:ka
  JA.builds = {
    "g:wa-desu": [
      { en: "This is a book.", chunks: [{ id: "a", t: "これは" }, { id: "b", t: "本" }, { id: "c", t: "です" }], last: "c", before: [["a", "b", "The topic (これは) comes before what you say about it."]], natural: ["a", "b", "c"], kana: "これはほんです" },
      { en: "That over there is a cat.", chunks: [{ id: "a", t: "あれは" }, { id: "b", t: "ねこ" }, { id: "c", t: "です" }], last: "c", before: [["a", "b", "The topic (あれは) comes before what you say about it."]], natural: ["a", "b", "c"], kana: "あれはねこです" }
    ],
    "g:ka": [
      { en: "What is that (near you)?", chunks: [{ id: "a", t: "それは" }, { id: "b", t: "なん" }, { id: "c", t: "です" }, { id: "d", t: "か" }], last: "d", lastWhy: "か goes at the very end: it turns the whole sentence into a question.", before: [["a", "b", "The topic (それは) comes first."], ["c", "d", "か follows です."]], natural: ["a", "b", "c", "d"], kana: "それはなんですか" }
    ]
  };
  // particle templates (particle-slot)
  JA.particles = [
    { before: "これ", after: "{本|ほん}です。", en: "This is a book.", target: "は", accept: { "が": "Also grammatical: が puts the focus on “this one” — an answer to “which is the book?”." }, wrong: { "を": "を marks what a verb acts on; です has no object.", "の": "の links two nouns (これの本 is not Japanese)." }, options: ["は", "が", "を", "の"] },
    { before: "あれ", after: "かさですか。", en: "Is that over there an umbrella?", target: "は", accept: {}, wrong: { "を": "を marks what a verb acts on.", "か": "か goes at the end of the sentence." }, options: ["は", "を", "か", "の"] },
    { before: "これ", after: "ケーキですか。", en: "Is THIS cake too?", target: "も", accept: { "は": "Grammatical, but the English says “too”: that is も." }, wrong: { "を": "を marks what a verb acts on." }, options: ["は", "も", "を", "が"] }
  ];
  // translate-en-ja (W of grammar): accepted kana renderings; dictation strategy compares by mora
  JA.translations = {
    "g:wa-desu": [{ en: "That (near you) is a pen.", target: "それはぺんです" }, { en: "This is cake.", target: "これはけーきです" }],
    "g:kosoa": [{ en: "That over there is a book.", target: "あれはほんです" }, { en: "This is an umbrella.", target: "これはかさです" }],
    "g:ka": [{ en: "What is this?", target: "これはなんですか" }, { en: "Is that (near you) a cat?", target: "それはねこですか" }]
  };
  // minimal pairs for the sound items (L)
  JA.pairs = [["おばさん", "おばあさん", "aunt", "grandmother"], ["きて", "きって", "come (て-form)", "stamp"], ["ここ", "こうこう", "here", "high school"], ["かこ", "かっこ", "the past", "brackets"]];

  // the graded passage (input), with furigana by mastery
  JA.passage = {
    title: "In the café", lines: [
      { who: "陽太", ja: "これはなんですか。", en: "What is this?" },
      { who: "灯", ja: "それはケーキです。", en: "That is cake." },
      { who: "陽太", ja: "あれもケーキですか。", en: "Is that over there cake too?" },
      { who: "灯", ja: "いいえ、あれはねこです。", en: "No, that over there is a cat." },
      { who: "陽太", ja: "ねこ！？", en: "A cat!?" }
    ],
    q: [{ q: "What does Akari say the thing over there is?", options: ["cake", "a cat", "a book", "an umbrella"], a: 1 }]
  };

  JA.lessons = [
    { id: "kana", stage: 0, title: "Hiragana あ to そ", items: JA.kanaSet.map(function (p) { return "k:" + p[0]; }), mins: 15 },
    { id: "1.1", stage: 1, title: "This, that and that over there", sub: "これ・それ・あれ + は + です", mins: 25,
      items: ["w:kore", "w:sore", "w:are", "w:dore", "w:hon", "w:pen", "w:kasa", "w:keeki", "w:neko", "w:nan", "j:本", "g:wa-desu", "g:kosoa", "g:ka"] }
  ];

  // milestones for the path strip (plan §10.2); requirements in stable reading words
  JA.milestones = [
    { id: "kana", title: "Read all kana fluently", need: { kana: 92 } },
    { id: "gr1", title: "Graded reader, level 1", need: { R: 300 } },
    { id: "yotsuba", title: "Yotsuba&! with a dictionary", need: { R: 1200, kanji: 100 } },
    { id: "jpsubs", title: "Slice-of-life anime, JP subtitles", need: { R: 2500, L: 2500 } },
    { id: "shounen", title: "Shounen manga", need: { R: 4000 } },
    { id: "raw", title: "Easy anime, raw", need: { L: 5000 } }
  ];

  JA.items = items;
})(typeof window !== "undefined" ? window : globalThis);
