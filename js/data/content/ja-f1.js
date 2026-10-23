/* Kurenai OS — data/content/ja-f1.js
   Stage 1, unit F1 (First conversations): six lessons, AUTHORED and original (docs/japanese-plan.md
   §4.2). Every lesson has the eight pages in order — Hook, Core idea, Patterns, Listen & notice,
   Pitfalls, Culture & usage, Practise, Quick reference — with a media moment on its Hook, at least
   eight voiced examples, a graded passage and a shadowing set (smoke82). No romaji past Stage 0
   (decision H): kanji carry furigana by mastery, {漢|かん}. Speakers: akari, yota, makoto, narrator. */
(function () {
  "use strict";
  var C = window.KOS_CONTENT = window.KOS_CONTENT || {};
  var J = window.KOS_JA;
  var A = "akari", Y = "yota", M = "makoto", N = "narrator";
  function ln(who, ja, en) { return { line: { who: who, ja: ja, en: en } }; }
  function L(who, ja, en) { return { who: who, ja: ja, en: en }; }
  function pt(f, en, eg, egEn) { return { pattern: { f: f, en: en, eg: eg, egEn: egEn } }; }
  function tip(t, body) { return { callout: { t: t, body: body } }; }

  /* the Quick reference is built from the lesson's own items, so it can never disagree with them */
  function quickRef(ref) {
    var l = J.LESSONS[ref], words = [], gram = [], kanji = [];
    l.items.forEach(function (k) {
      var it = J.ITEMS[k]; if (!it) return;
      if (it.kind === "word") words.push([it.ruby, it.r, it.en.slice(0, 2).join(", ")]);
      if (it.kind === "kanji") kanji.push([it.w, it.r + " (in " + J.ITEMS[it.in].w + ")", it.en.join(", ")]);
      if (it.kind === "grammar") gram.push([it.w, it.en, it.note]);
    });
    var out = [{ table: { head: ["Word", "Reading", "Meaning"], rows: words } }];
    if (kanji.length) out.push({ table: { head: ["Kanji", "Read here as", "Meaning"], rows: kanji } });
    out.push({ table: { head: ["Pattern", "Means", "Remember"], rows: gram } });
    return out;
  }
  function lesson(ref, o) {
    C["ja:" + ref] = { pages: [
      { t: "Hook", blocks: [o.media].concat(o.hook) },
      { t: "Core idea", blocks: o.core },
      { t: "Patterns", blocks: o.patterns },
      { t: "Listen & notice", blocks: [{ p: o.listen }].concat(o.lines.map(function (x) { return { line: x }; })).concat(o.listenMore || []) },
      { t: "Pitfalls", blocks: o.pitfalls.map(function (x) { return tip(x[0], x[1]); }) },
      { t: "Culture & usage", blocks: o.culture.map(function (x) { return tip(x[0], x[1]); }) },
      { t: "Practise", blocks: [{ passage: o.passage }, { shadow: o.shadow }, { go: o.go }] },
      { t: "Quick reference", blocks: quickRef(ref) }
    ] };
  }

  /* ================= 1.1 ================= */
  lesson("1.1", {
    media: { panel: {
      img: "ja.panel.kosoa.1", w: 1800, h: 1344,
      alt: "Manga panel in the café: Yōta holds a slice of cake close to himself; Akari, a couple of metres away, holds an iced drink; a framed cat poster hangs far behind them.",
      bubbles: [
        { who: A, ja: "それは\nなんですか。", en: "What's that (near you)?", x: 89, y: 20, rx: 8, ry: 17, tail: [80, 24], size: 2.7 },
        { who: Y, ja: "これですか？\nケーキです。", en: "This? It's cake.", x: 9, y: 25, rx: 8, ry: 20, tail: [21, 26], size: 2.7 }
      ] } },
    hook: [{ p: "Three words point at anything. Yōta holds the cake, so for him it is これ; for Akari, across the table, it is それ." }],
    core: [
      { p: "Pick the word by where the thing is:" },
      { table: { head: ["", "near me", "near you", "far from us both", "which?"], rows: [["a thing", "これ", "それ", "あれ", "どれ"]] } },
      { p: "Then name it with は and です:" },
      { p: "これは{本|ほん}です。 — “This is a book.”" },
      { p: "は marks what you are talking about (the topic). It is written は and said わ." },
      { p: "です ends a polite statement. It works like “is”, and it never changes for I, you or they." },
      { p: "か at the very end turns it into a question." }
    ],
    patterns: [
      pt("Ｘは Ｙです。", "X is Y — a polite statement.", "これは{本|ほん}です。", "This is a book."),
      pt("Ｘは Ｙですか。", "Is X Y? — か makes the question.", "それはケーキですか。", "Is that (near you) cake?"),
      pt("Ｘは なんですか。", "What is X? — なん asks “what”.", "あれはなんですか。", "What is that over there?")
    ],
    listen: "Notice who holds what: the word changes with the distance, not with the thing.",
    lines: [
      L(A, "これはペンです。", "This is a pen."),
      L(Y, "それはかさですか。", "Is that (near you) an umbrella?"),
      L(A, "それはかさです。", "That's an umbrella."),
      L(Y, "あれはなんですか。", "What's that over there?"),
      L(A, "あれはねこです。", "That over there is a cat."),
      L(Y, "ペンはどれですか。", "Which one is the pen?"),
      L(A, "これです。", "This one.")
    ],
    listenMore: [{ panel: {
      img: "ja.panel.kosoa.2", w: 1380, h: 1800,
      alt: "Tall manga panel: Yōta points excitedly far into the distance, still holding the cake plate; Akari follows his finger with her eyes, amused.",
      bubbles: [
        { who: Y, ja: "あれも\nケーキですか！？", en: "Is that over there cake too!?", x: 20, y: 17, rx: 13, ry: 14, tail: [36, 32], size: 4.2 },
        { who: A, ja: "いいえ、\nあれは\nねこです。", en: "No, that over there is a cat.", x: 85, y: 86, rx: 12, ry: 11, tail: [89, 66], size: 3.6 }
      ], sfx: [{ ja: "ビシッ", x: 22, y: 74, size: 13, rot: -14 }] } }],
    pitfalls: [
      ["は is said わ", "As a particle, は is pronounced わ. It is still written は — always."],
      ["それ is near YOU", "English “that” covers both それ and あれ. Ask: is it near the listener (それ) or far from both of you (あれ)?"],
      ["No question mark needed", "か already makes the question. Japanese ends it with 。; ？ turns up in casual writing."],
      ["これ stands alone", "これ means “this thing” by itself. “This book” is a different word, この{本|ほん} — it comes later."]
    ],
    culture: [
      ["Pointing", "Pointing a finger at things is fine. At people it is rude — use an open hand instead."],
      ["なん or なに", "何 is read なん before です and なに in most other places. なにですか is a mistake."]
    ],
    passage: { title: "In the café", lines: [
      L(Y, "これはなんですか。", "What is this?"), L(A, "それはケーキです。", "That is cake."),
      L(Y, "あれもケーキですか。", "Is that over there cake too?"), L(A, "いいえ、あれはねこです。", "No, that over there is a cat."), L(Y, "ねこ！？", "A cat!?")
    ], q: { q: "What does Akari say the thing over there is?", options: ["cake", "a cat", "a book", "an umbrella"], a: 1, why: "あれはねこです — that over there is a cat." } },
    shadow: [L(A, "これは{本|ほん}です。", "This is a book."), L(Y, "それはなんですか。", "What is that?"), L(A, "あれはねこです。", "That over there is a cat.")],
    go: "words, the kanji 本 and three patterns · about 12 minutes"
  });

  /* ================= 1.2 ================= */
  lesson("1.2", {
    media: { scene: { title: "The first day", bg: "ja.bg.classroom", left: Y, right: A, alt: "A classroom after school.", lines: [
      L(A, "はじめまして。", "Nice to meet you."), Object.assign(L(A, "わたしはあかりです。", "I'm Akari."), { face: "happy" }),
      Object.assign(L(Y, "はじめまして、ようたです。", "Nice to meet you, I'm Yōta."), { face: "happy" }),
      L(Y, "よろしくおねがいします。", "Pleased to meet you."), Object.assign(L(A, "よろしくおねがいします。", "Pleased to meet you too."), { face: "happy" }),
      Object.assign(L(Y, "あかりさんは{先生|せんせい}ですか。", "Akari, are you a teacher?"), { face: "thinking" }),
      Object.assign(L(A, "{先生|せんせい}じゃないです。{学生|がくせい}です！", "I'm not a teacher. I'm a student!"), { face: "surprised", other: { yota: "troubled" } })
    ] } },
    hook: [{ p: "Every introduction is the same three steps. Press the text box to move through the scene." }],
    core: [
      { p: "Introducing yourself, in order:" },
      { table: { head: ["Step", "Say", "Means"], rows: [["1", "はじめまして。", "Nice to meet you (first time only)."], ["2", "Ｘです。", "I'm X."], ["3", "よろしくおねがいします。", "Pleased to meet you / please be kind to me."]] } },
      { p: "さん goes after other people's names: ようたさん, あかりさん. Never after your own." },
      { p: "の joins two nouns: the first says whose, or what kind." },
      { p: "わたしの{名前|なまえ} — my name. {日|に}{本|ほん}の{本|ほん} — a Japanese book." }
    ],
    patterns: [
      pt("はじめまして。Ｘです。", "Nice to meet you. I'm X.", "はじめまして、ようたです。", "Nice to meet you, I'm Yōta."),
      pt("わたしは Ｘです。", "I am X.", "わたしは{学生|がくせい}です。", "I'm a student."),
      pt("Ａの Ｂ", "A's B, or a B of A: A says whose or what kind.", "わたしの{名前|なまえ}はあかりです。", "My name is Akari."),
      pt("Ｘさん", "Mr or Ms X — for other people only.", "ようたさんは{高校生|こうこうせい}です。", "Yōta is a high school student.")
    ],
    listen: "Notice that people drop わたしは once it's clear who they mean.",
    lines: [
      L(A, "{名前|なまえ}はなんですか。", "What's your name?"),
      L(Y, "ようたです。", "I'm Yōta."),
      L(A, "{日|に}{本|ほん}{人|じん}ですか。", "Are you Japanese?"),
      L(Y, "{日|に}{本|ほん}{人|じん}です。", "I'm Japanese."),
      L(N, "わたしはイギリス{人|じん}です。", "I'm British."),
      L(A, "{先生|せんせい}の{本|ほん}です。", "It's the teacher's book."),
      L(Y, "ともだちのペンです。", "It's my friend's pen.")
    ],
    listenMore: [{ panel: {
      img: "ja.panel.intro.1", w: 1800, h: 1345,
      alt: "Manga panel in an empty classroom: Yōta scratches his head with an embarrassed grin; Akari, hands pressed together, bows a little and smiles.",
      bubbles: [
        { who: Y, ja: "はじめまして、\nようたです。", en: "Nice to meet you, I'm Yōta.", x: 85, y: 15, rx: 10, ry: 13, tail: [76, 24], size: 2.7 },
        { who: A, ja: "よろしく\nおねがい\nします。", en: "Pleased to meet you.", x: 14, y: 18, rx: 10, ry: 15, tail: [25, 28], size: 2.7 }
      ] } }],
    pitfalls: [
      ["Never さん for yourself", "わたしはようたさんです sounds like you're honouring yourself. Just ようたです."],
      ["の goes between", "わたしの{名前|なまえ}: owner, の, thing. {名前|なまえ}のわたし means something else entirely."],
      ["はじめまして once", "It means “for the first time”: say it on the first meeting only."],
      ["じん after a country", "Country + {人|じん} is a person from there: イギリス{人|じん}, {日|に}{本|ほん}{人|じん}."]
    ],
    culture: [
      ["Family name first", "Japanese names put the family name first: in 白石 灯 (しらいし あかり), しらいし is the family. Classmates use family names with さん until they are close."],
      ["A small bow", "よろしくおねがいします usually comes with a slight bow — a nod from the shoulders is enough."]
    ],
    passage: { title: "The first day", lines: [
      L(A, "はじめまして。わたしはあかりです。", "Nice to meet you. I'm Akari."), L(Y, "はじめまして。ようたです。", "Nice to meet you. I'm Yōta."),
      L(A, "ようたさんは{学生|がくせい}ですか。", "Are you a student, Yōta?"), L(Y, "{高校生|こうこうせい}です。", "I'm a high school student."),
      L(A, "よろしくおねがいします。", "Pleased to meet you.")
    ], q: { q: "What does Yōta say he is?", options: ["a teacher", "a high school student", "British", "Akari's friend"], a: 1, why: "{高校生|こうこうせい}です — a high school student." } },
    shadow: [L(Y, "はじめまして、ようたです。", "Nice to meet you, I'm Yōta."), L(A, "わたしの{名前|なまえ}はあかりです。", "My name is Akari."), L(Y, "よろしくおねがいします。", "Pleased to meet you.")],
    go: "words, the kanji 日 and 人 and three patterns · about 14 minutes"
  });

  /* ================= 1.3 ================= */
  lesson("1.3", {
    media: { scene: { title: "Coffee or tea?", bg: "ja.bg.cafe", left: Y, right: A, alt: "The café in the afternoon.", lines: [
      Object.assign(L(Y, "これはコーヒーですか。", "Is this coffee?"), { face: "thinking" }),
      L(A, "いいえ、コーヒーじゃないです。", "No, it isn't coffee."), Object.assign(L(A, "お{茶|ちゃ}です。", "It's tea."), { face: "happy" }),
      L(Y, "それもお{茶|ちゃ}ですか。", "Is that tea too?"),
      Object.assign(L(A, "いいえ、ちがいます。{水|みず}です。", "No, it's water."), { face: "troubled" }),
      Object.assign(L(Y, "あれもお{茶|ちゃ}ですか。", "Is that over there tea too?"), { face: "happy" }),
      Object.assign(L(A, "はい、そうです！", "Yes, it is!"), { face: "happy", other: { yota: "surprised" } })
    ] } },
    hook: [{ p: "Three ways to answer, and one tiny word for “too”. Press the text box to move through the scene." }],
    core: [
      { p: "To say something is NOT X, swap です for じゃないです:" },
      { p: "コーヒーです (it's coffee) → コーヒーじゃないです (it isn't coffee)." },
      { p: "To answer a question: はい (yes) or いいえ (no)." },
      { p: "はい、そうです — yes, that's right. いいえ、ちがいます — no, that's wrong." },
      { p: "も means “too”. It takes the place of は: これもパンです — this is bread too." }
    ],
    patterns: [
      pt("Ｘじゃないです。", "It isn't X.", "これはコーヒーじゃないです。", "This isn't coffee."),
      pt("Ｘも Ｙです。", "X is Y too — も replaces は.", "これもパンです。", "This is bread too."),
      pt("はい、そうです。／いいえ、ちがいます。", "Yes, that's right. / No, that's not right.", "いいえ、ちがいます。", "No, that's not right.")
    ],
    listen: "Listen for じゃないです at the end: the whole sentence turns on it.",
    lines: [
      L(Y, "それは{水|みず}ですか。", "Is that water?"),
      L(A, "いいえ、{水|みず}じゃないです。", "No, it isn't water."),
      L(A, "これもパンです。", "This is bread too."),
      L(Y, "わたしも{学生|がくせい}です。", "I'm a student too."),
      L(A, "ようたさんは{先生|せんせい}じゃないです。", "Yōta isn't a teacher."),
      L(Y, "あれもいぬですか。", "Is that over there a dog too?"),
      L(A, "はい、そうです。", "Yes, that's right.")
    ],
    pitfalls: [
      ["Never は and も together", "これはもパン is wrong: も takes は's place — これもパン."],
      ["じゃないです replaces です", "コーヒーですじゃない is wrong. The ending changes: コーヒーじゃないです."],
      ["Answering “isn't it?”", "To “isn't it tea?” はい means “right, it isn't”. Japanese answers the question, not the fact."],
      ["ちがいます for facts", "いいえ、ちがいます corrects a fact. To refuse something offered you'd say something else, later."]
    ],
    culture: [
      ["Soft no", "A bare いいえ sounds stiff in conversation. People soften it: いいえ、ちがいます, or just a small laugh and the right answer."],
      ["The お in お茶", "お is a polite prefix. お{茶|ちゃ} is almost always said with it; plain 茶 sounds rough."],
      ["ではありません", "{学生|がくせい}ではありません says the same as じゃないです, more formally — you'll read it on signs and in news."]
    ],
    passage: { title: "Coffee or tea?", lines: [
      L(Y, "これはコーヒーですか。", "Is this coffee?"), L(A, "いいえ、お{茶|ちゃ}です。", "No, it's tea."),
      L(Y, "それもお{茶|ちゃ}ですか。", "Is that tea too?"), L(A, "いいえ、ちがいます。{水|みず}です。", "No. It's water.")
    ], q: { q: "What is in Akari's glass?", options: ["coffee", "tea", "water", "juice"], a: 2, why: "{水|みず}です — it's water." } },
    shadow: [L(A, "いいえ、コーヒーじゃないです。", "No, it isn't coffee."), L(Y, "これもパンですか。", "Is this bread too?"), L(A, "はい、そうです。", "Yes, that's right.")],
    go: "words, the kanji 水 and three patterns · about 12 minutes"
  });

  /* ================= 1.4 ================= */
  lesson("1.4", {
    media: { scene: { title: "How old?", bg: "ja.bg.classroom", left: Y, right: A, alt: "A classroom after school.", lines: [
      Object.assign(L(Y, "あかりさんはなんさいですか。", "Akari, how old are you?"), { face: "thinking" }),
      Object.assign(L(A, "{十七|じゅうなな}さいです。", "I'm seventeen."), { face: "happy" }),
      Object.assign(L(Y, "わたしは{十六|じゅうろく}さいです。", "I'm sixteen."), { face: "happy" }),
      L(A, "ようたさんの{先生|せんせい}は？", "And your teacher?"),
      Object.assign(L(Y, "えっと…{四十|よんじゅう}…{五十|ごじゅう}…？", "Um… forty… fifty…?"), { face: "troubled", other: { akari: "surprised" } })
    ] } },
    hook: [{ p: "Ten kanji and the word 百 build every number up to 999. Press the text box to move through the scene." }],
    core: [
      { table: { head: ["Kanji", "Reading", "Value"], rows: [["一", "いち", "1"], ["二", "に", "2"], ["三", "さん", "3"], ["四", "よん・し", "4"], ["五", "ご", "5"], ["六", "ろく", "6"], ["七", "なな・しち", "7"], ["八", "はち", "8"], ["九", "きゅう・く", "9"], ["十", "じゅう", "10"], ["百", "ひゃく", "100"]] } },
      { p: "Bigger numbers are sums you read left to right:" },
      { p: "十一 = 10 + 1 = 11 (じゅういち). 二十 = 2 × 10 = 20 (にじゅう). 四十五 = 4 × 10 + 5 = 45 (よんじゅうご)." },
      { p: "Age is the number plus さい: {十六|じゅうろく}さい — sixteen years old." }
    ],
    patterns: [
      pt("十 ＋ 一 ＝ {十一|じゅういち}", "Ten plus one: the teens put 十 first.", "{十一|じゅういち}", "eleven"),
      pt("二 × 十 ＝ {二十|にじゅう}", "Two tens: the tens put the count first.", "{四十五|よんじゅうご}", "forty-five"),
      pt("Ｎさいです。", "I'm N years old.", "{十七|じゅうなな}さいです。", "I'm seventeen."),
      pt("なんさいですか。", "How old are you?", "なんさいですか。", "How old are you?")
    ],
    listen: "Notice よん and なな: they are the safe readings of 4 and 7 for counting and ages.",
    lines: [
      L(N, "{三十八|さんじゅうはち}", "38"),
      L(N, "{六十四|ろくじゅうよん}", "64"),
      L(N, "{九十九|きゅうじゅうきゅう}", "99"),
      L(N, "{百|ひゃく}", "100"),
      L(A, "わたしは{十七|じゅうなな}さいです。", "I'm seventeen."),
      L(Y, "{十六|じゅうろく}さいです。", "I'm sixteen."),
      L(A, "なんさいですか。", "How old are you?")
    ],
    pitfalls: [
      ["Two readings for 4, 7 and 9", "Counting and ages use よん, なな and きゅう. し, しち and く turn up in dates and set words."],
      ["1, 8 and 10 change before さい", "いっさい (1), はっさい (8), じゅっさい (10). The others just add さい."],
      ["20 years old", "Twenty, as an age, has its own word: はたち."],
      ["Digits or kanji", "Prices and times are written 1, 2, 3 in everyday horizontal text. Kanji numbers fill vertical text, signs and set words."]
    ],
    culture: [
      ["Unlucky numbers", "し sounds like “death” and く like “suffering”, so 4 and 9 are avoided for room numbers and gifts."],
      ["Asking age", "なんさいですか is fine between students. To an adult, おいくつですか is the polite way — or don't ask."]
    ],
    passage: { title: "How old?", lines: [
      L(Y, "あかりさんはなんさいですか。", "Akari, how old are you?"), L(A, "{十七|じゅうなな}さいです。ようたさんは？", "Seventeen. And you, Yōta?"),
      L(Y, "{十六|じゅうろく}さいです。", "Sixteen."), L(A, "わたしの{先生|せんせい}は{四十二|よんじゅうに}さいです。", "My teacher is forty-two.")
    ], q: { q: "How old is Akari's teacher?", options: ["17", "16", "42", "24"], a: 2, why: "{四十二|よんじゅうに}さい — forty-two." } },
    shadow: [L(N, "{十一|じゅういち}、{二十|にじゅう}、{九十九|きゅうじゅうきゅう}", "11, 20, 99"), L(A, "なんさいですか。", "How old are you?"), L(Y, "{十六|じゅうろく}さいです。", "I'm sixteen.")],
    go: "the numbers, their kanji and two patterns · about 15 minutes"
  });

  /* ================= 1.5 ================= */
  lesson("1.5", {
    media: { scene: { title: "Which way out?", bg: "ja.bg.station", left: Y, right: A, alt: "A station platform.", lines: [
      Object.assign(L(Y, "すみません、トイレはどこですか。", "Excuse me, where's the toilet?"), { face: "troubled" }),
      L(A, "トイレはあそこです。", "The toilet is over there."),
      Object.assign(L(Y, "ありがとうございます！", "Thank you!"), { face: "happy" }),
      Object.assign(L(A, "あ、{出口|でぐち}はそこです。", "Oh, and the exit is right there by you."), { face: "thinking" }),
      Object.assign(L(Y, "ここですか？", "Here?"), { face: "surprised" }),
      Object.assign(L(A, "はい、そこです。", "Yes, right there."), { face: "happy" })
    ] } },
    hook: [{ p: "これ・それ・あれ have a twin set for places. Press the text box to move through the scene." }],
    core: [
      { table: { head: ["", "near me", "near you", "far from us both", "which?"], rows: [["a thing", "これ", "それ", "あれ", "どれ"], ["a place", "ここ", "そこ", "あそこ", "どこ"]] } },
      { p: "Ask where something is by making it the topic, then どこですか:" },
      { p: "トイレはどこですか。 — Where is the toilet?" },
      { p: "Answer with a place word and です: あそこです。 — It's over there." },
      { p: "Start with すみません when you speak to a stranger." }
    ],
    patterns: [
      pt("Ｘは どこですか。", "Where is X?", "トイレはどこですか。", "Where is the toilet?"),
      pt("Ｘは ここ・そこ・あそこです。", "X is here, there, or over there.", "{出口|でぐち}はあそこです。", "The exit is over there."),
      pt("すみません、…", "Excuse me — to get a stranger's attention.", "すみません、{駅|えき}はどこですか。", "Excuse me, where's the station?")
    ],
    listen: "Listen for the place word in each answer: it carries the whole meaning.",
    lines: [
      L(Y, "ホームはどこですか。", "Where's the platform?"),
      L(A, "ホームはここです。", "The platform is here."),
      L(Y, "{入口|いりぐち}はどこですか。", "Where's the entrance?"),
      L(A, "{入口|いりぐち}はあそこです。", "The entrance is over there."),
      L(Y, "きっぷはどこですか。", "Where's the ticket?"),
      L(A, "そこです！", "It's right there, by you!"),
      L(Y, "ありがとうございます。", "Thank you.")
    ],
    listenMore: [{ panel: {
      img: "ja.panel.where.1", w: 1800, h: 1344,
      alt: "Manga panel on a country station platform: Akari points down the platform towards the stairs; Yōta, holding an open map, looks where she points, puzzled.",
      bubbles: [
        { who: A, ja: "{出口|でぐち}は\nあそこです。", en: "The exit is over there.", x: 69, y: 21, rx: 9, ry: 15, tail: [56, 37], size: 2.7 },
        { who: Y, ja: "あそこ\nですか？", en: "Over there?", x: 11, y: 19, rx: 8, ry: 13, tail: [21, 29], size: 2.7 }
      ] } }],
    pitfalls: [
      ["ここ is a place, これ is a thing", "ここはなんですか asks “what is this place?”, not “what is this?”"],
      ["どこ, not どれ", "どこ asks where; どれ asks which one."],
      ["Two readings of 入", "{入口|いりぐち} is いりぐち, not にゅうぐち; {出口|でぐち} is でぐち. Kanji read differently in different words."],
      ["すみません is not only sorry", "It gets attention, apologises, and — when someone goes to trouble for you — thanks them."]
    ],
    culture: [
      ["Signs you can read now", "出口 and 入口 hang over every station stair and shop door. They are some of the first kanji you'll meet in the wild."],
      ["Big stations", "Shinjuku station has over two hundred exits. Even Japanese people ask: すみません、{出口|でぐち}はどこですか。"]
    ],
    passage: { title: "Which way out?", lines: [
      L(Y, "すみません、{出口|でぐち}はどこですか。", "Excuse me, where's the exit?"), L(A, "{出口|でぐち}はあそこです。", "The exit is over there."),
      L(Y, "トイレもあそこですか。", "Is the toilet over there too?"), L(A, "いいえ、トイレはここです。", "No, the toilet is here.")
    ], q: { q: "Where is the toilet?", options: ["over there", "here, near Akari", "by Yōta", "at the exit"], a: 1, why: "トイレはここです — here, near the speaker, Akari." } },
    shadow: [L(Y, "すみません、トイレはどこですか。", "Excuse me, where's the toilet?"), L(A, "あそこです。", "Over there."), L(Y, "ありがとうございます。", "Thank you.")],
    go: "words, the kanji 口, 出 and 入 and two patterns · about 13 minutes"
  });

  /* ================= 1.6 ================= */
  lesson("1.6", {
    media: { scene: { title: "Coffee, please", bg: "ja.bg.cafe", left: Y, right: M, alt: "The café; Makoto, the owner, behind the counter.", lines: [
      Object.assign(L(M, "いらっしゃいませ。", "Welcome."), { face: "happy" }),
      L(Y, "コーヒーをください。", "A coffee, please."),
      L(M, "はい、どうぞ。", "Here you are."),
      Object.assign(L(Y, "ケーキはいくらですか。", "How much is the cake?"), { face: "thinking" }),
      L(M, "{四百|よんひゃく}{円|えん}です。", "It's 400 yen."),
      Object.assign(L(Y, "ケーキもください！", "The cake too, please!"), { face: "happy" }),
      Object.assign(L(M, "ありがとうございます。", "Thank you very much."), { face: "happy" })
    ] } },
    hook: [{ p: "Order, ask the price, understand the answer. Press the text box to move through the scene." }],
    core: [
      { p: "Ask for something with を and ください: コーヒーをください — coffee, please." },
      { p: "Ask the price with いくら: これはいくらですか — how much is this?" },
      { p: "The answer is a number and {円|えん}. Hundreds and thousands, with their sound changes:" },
      { table: { head: ["", "×100", "×1000"], rows: [["1", "{百|ひゃく}", "{千|せん}"], ["2", "にひゃく", "にせん"], ["3", "さんびゃく", "さんぜん"], ["4", "よんひゃく", "よんせん"], ["5", "ごひゃく", "ごせん"], ["6", "ろっぴゃく", "ろくせん"], ["7", "ななひゃく", "ななせん"], ["8", "はっぴゃく", "はっせん"], ["9", "きゅうひゃく", "きゅうせん"]] } }
    ],
    patterns: [
      pt("Ｘを ください。", "X, please.", "コーヒーをください。", "A coffee, please."),
      pt("Ｘは いくらですか。", "How much is X?", "ケーキはいくらですか。", "How much is the cake?"),
      pt("Ｎ{円|えん}です。", "It's N yen.", "{六百|ろっぴゃく}{円|えん}です。", "It's 600 yen.")
    ],
    listen: "Listen for びゃく and ぴゃく, ぜん and っせん: the sound changes tell you the number.",
    lines: [
      L(Y, "メニューをください。", "The menu, please."),
      L(M, "はい、どうぞ。", "Here you are."),
      L(Y, "{紅茶|こうちゃ}はいくらですか。", "How much is the tea?"),
      L(M, "{三百|さんびゃく}{円|えん}です。", "It's 300 yen."),
      L(Y, "サンドイッチをください。", "A sandwich, please."),
      L(M, "{八百|はっぴゃく}{円|えん}です。", "That's 800 yen."),
      L(M, "{千|せん}{円|えん}ですね。ありがとうございます。", "That's 1,000 yen. Thank you very much.")
    ],
    pitfalls: [
      ["を is said お", "Like は, the particle を is written を but pronounced お."],
      ["Sound changes", "300 is さんびゃく, 600 ろっぴゃく, 800 はっぴゃく; 3,000 さんぜん, 8,000 はっせん. The rest add ひゃく or せん unchanged."],
      ["四百, not しひゃく", "Hundreds use よん: よんひゃく. し is avoided here as in ages."],
      ["Don't answer いらっしゃいませ", "It's a welcome, not a greeting to return. A small nod is enough."]
    ],
    culture: [
      ["The money tray", "At the till, put your money in the small tray, not in the person's hand. Change comes back the same way."],
      ["円 and yen", "{円|えん} is said えん; “yen” is an old English spelling. The sign is ¥."],
      ["Tax included", "Prices often show 税込 (tax included) beside them. You'll read it later; for now, look for the bigger number."]
    ],
    passage: { title: "Coffee, please", lines: [
      L(M, "いらっしゃいませ。", "Welcome."), L(Y, "{紅茶|こうちゃ}をください。", "A tea, please."),
      L(Y, "ケーキはいくらですか。", "How much is the cake?"), L(M, "{五百|ごひゃく}{円|えん}です。", "It's 500 yen."),
      L(Y, "じゃ、ケーキもください。", "Then the cake too, please.")
    ], q: { q: "How much is the cake?", options: ["300 yen", "400 yen", "500 yen", "800 yen"], a: 2, why: "{五百|ごひゃく}{円|えん}です — 500 yen." } },
    shadow: [L(Y, "コーヒーをください。", "A coffee, please."), L(Y, "これはいくらですか。", "How much is this?"), L(M, "{六百|ろっぴゃく}{円|えん}です。", "It's 600 yen.")],
    go: "words, the kanji 円 and 千 and three patterns · about 14 minutes"
  });
})();
