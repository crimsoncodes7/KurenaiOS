/* Kurenai OS — data/ja-s1.js
   Stage 1 (基 Foundations), released one unit at a time (docs/japanese-plan.md §3.1). AUTHORED:
   every gloss, note and sentence here is written for KurenaiOS (no dictionary data is embedded;
   the reader's lookup is a later release). Units: F1, First conversations; F2, Days and times.

   Items it adds to KOS_JA.ITEMS (§4.1):
     w:<written form>  a word      { w, r (kana), ruby (markup), en: [glosses], forms?, note? }
     j:<kanji>         a kanji     { w, r (the reading asked), in (the word it is read in), en }
     g:<slug>          a grammar point { w (the pattern), en, note,
                         says:      [{ ja (markup), kana, en }] — heard, read and written back
                         particles: [{ before, after, en, target, options, accept?, wrong? }]
                         builds:    [{ en, chunks, natural, last?, lastWhy?, before? }] }
   A lesson: { id, unit, title, can, items, produce } — `produce` is its production set (the words
   that later get a Writing facet, invariant 113). */
(function () {
  "use strict";
  var J = window.KOS_JA, I = J.ITEMS;

  function word(w, r, en, o) {
    o = o || {};
    I["w:" + w] = { key: "w:" + w, kind: "word", w: w, r: r, ruby: o.ruby || w, en: en, forms: o.forms || null, note: o.note || null };
    return "w:" + w;
  }
  function kanji(ch, r, inWord, en, note) {
    I["j:" + ch] = { key: "j:" + ch, kind: "kanji", w: ch, r: r, in: inWord, en: en, note: note || null };
    return "j:" + ch;
  }
  function gram(slug, w, en, o) {
    o = o || {};
    I["g:" + slug] = { key: "g:" + slug, kind: "grammar", w: w, en: en, note: o.note || null,
      says: o.says || [], particles: o.particles || [], builds: o.builds || [] };
    return "g:" + slug;
  }
  function s(ja, kana, en) { return { ja: ja, kana: kana, en: en }; }
  function chunks(list) { return list.map(function (t, i) { return { id: String.fromCharCode(97 + i), t: t }; }); }
  function build(en, parts, o) {
    o = o || {};
    var c = chunks(parts), ids = c.map(function (x) { return x.id; });
    return { en: en, chunks: c, natural: ids, last: ids[ids.length - 1], lastWhy: o.lastWhy || null, before: o.before || [] };
  }

  /* ================= 1.1 This, that and that over there ================= */
  var L11 = [
    word("これ", "これ", ["this", "this one"], { note: "near me, the speaker" }),
    word("それ", "それ", ["that", "that one"], { note: "near you, the listener" }),
    word("あれ", "あれ", ["that over there", "that", "that one over there"], { note: "far from both of us" }),
    word("どれ", "どれ", ["which", "which one"], { note: "the question word of the set" }),
    word("本", "ほん", ["book"], { ruby: "{本|ほん}" }),
    word("ペン", "ぺん", ["pen"]),
    word("かさ", "かさ", ["umbrella"], { note: "often written 傘" }),
    word("ケーキ", "けーき", ["cake"]),
    word("ねこ", "ねこ", ["cat"], { note: "often written 猫" }),
    word("なん", "なん", ["what"], { forms: [{ w: "なん", r: "なん" }, { w: "何", r: "なん" }, { w: "なに", r: "なに" }], note: "なん before です; written 何 later" }),
    kanji("本", "ほん", "w:本", ["book", "origin"], "A tree 木 with a line marking its root: the origin — and a book."),
    gram("wa-desu", "〜は 〜です", "X is Y", {
      note: "は marks the topic; です ends a polite statement.",
      says: [s("これは{本|ほん}です。", "これはほんです", "This is a book."), s("それはペンです。", "それはぺんです", "That (near you) is a pen."), s("あれはねこです。", "あれはねこです", "That over there is a cat.")],
      particles: [
        { before: "これ", after: "{本|ほん}です。", en: "This is a book.", target: "は", options: ["は", "が", "を", "の"],
          accept: { "が": "Also grammatical: が puts the weight on “this one” — an answer to “which is the book?”." },
          wrong: { "を": "を marks what a verb acts on; です has no object.", "の": "これの本 is not Japanese: この本 is “this book”." } },
        { before: "あれ", after: "ねこです。", en: "That over there is a cat.", target: "は", options: ["は", "を", "か", "の"],
          wrong: { "を": "を marks what a verb acts on.", "か": "か goes at the end of a sentence." } }
      ],
      builds: [build("This is a book.", ["これは", "{本|ほん}", "です"], { before: [["a", "b", "The topic (これは) comes before what you say about it."]] }),
        build("That over there is a cat.", ["あれは", "ねこ", "です"], { before: [["a", "b", "The topic (あれは) comes before what you say about it."]] })]
    }),
    gram("kosoa", "これ・それ・あれ", "this / that / that over there", {
      note: "Chosen by where the thing is: near me, near you, or far from us both.",
      says: [s("これはケーキです。", "これはけーきです", "This is cake."), s("それはかさです。", "それはかさです", "That (near you) is an umbrella."), s("あれは{本|ほん}です。", "あれはほんです", "That over there is a book.")],
      builds: [build("That (near you) is an umbrella.", ["それは", "かさ", "です"], { before: [["a", "b", "The topic (それは) comes first."]] })]
    }),
    gram("ka", "〜ですか", "a question", {
      note: "か at the very end makes a question. Written Japanese needs no question mark.",
      says: [s("これはなんですか。", "これはなんですか", "What is this?"), s("それはケーキですか。", "それはけーきですか", "Is that (near you) cake?"), s("ペンはどれですか。", "ぺんはどれですか", "Which one is the pen?")],
      particles: [{ before: "これはなんです", after: "。", en: "What is this?", target: "か", options: ["か", "は", "の", "も"], wrong: { "は": "は marks a topic; the question marker is か.", "の": "の links nouns; it doesn't make a question here." } }],
      builds: [build("What is that (near you)?", ["それは", "なん", "です", "か"], { lastWhy: "か goes at the very end: it turns the whole sentence into a question.", before: [["a", "b", "The topic (それは) comes first."], ["c", "d", "か follows です."]] })]
    })
  ];

  /* ================= 1.2 Nice to meet you ================= */
  var L12 = [
    word("わたし", "わたし", ["I", "me"], { note: "often written 私" }),
    word("はじめまして", "はじめまして", ["nice to meet you", "how do you do"], { note: "said only the first time you meet" }),
    word("よろしくおねがいします", "よろしくおねがいします", ["pleased to meet you", "nice to meet you", "please treat me well", "i look forward to working with you"]),
    word("さん", "さん", ["mr", "ms", "mrs", "miss"], { note: "after someone else's name — never your own" }),
    word("名前", "なまえ", ["name"], { ruby: "{名前|なまえ}" }),
    word("学生", "がくせい", ["student"], { ruby: "{学生|がくせい}" }),
    word("先生", "せんせい", ["teacher"], { ruby: "{先生|せんせい}" }),
    word("高校生", "こうこうせい", ["high school student", "high-school student"], { ruby: "{高校生|こうこうせい}" }),
    word("日本", "にほん", ["japan"], { ruby: "{日|に}{本|ほん}" }),
    word("日本人", "にほんじん", ["japanese person", "japanese"], { ruby: "{日|に}{本|ほん}{人|じん}" }),
    word("イギリス", "いぎりす", ["britain", "the uk", "uk", "england"]),
    word("ともだち", "ともだち", ["friend"], { note: "often written 友達" }),
    kanji("日", "に", "w:日本", ["day", "sun"], "The sun: a box with a line across. In 日本, “the sun's origin” — Japan."),
    kanji("人", "じん", "w:日本人", ["person"], "A person walking: two legs. After a country it reads じん."),
    gram("no", "〜の〜", "X's Y / Y of X", {
      note: "の links two nouns: the first one tells you which, whose or what kind.",
      says: [s("わたしの{名前|なまえ}はあかりです。", "わたしのなまえはあかりです", "My name is Akari."), s("{日本|にほん}の{本|ほん}です。", "にほんのほんです", "It's a Japanese book."), s("{先生|せんせい}のペンです。", "せんせいのぺんです", "It's the teacher's pen.")],
      particles: [{ before: "わたし", after: "{名前|なまえ}はあかりです。", en: "My name is Akari.", target: "の", options: ["の", "は", "を", "か"],
        wrong: { "は": "わたしは名前は… is two topics; “my name” is わたしの名前.", "を": "を marks what a verb acts on." } }],
      builds: [build("It's the teacher's pen.", ["{先生|せんせい}の", "ペン", "です"], { before: [["a", "b", "The owner (先生の) comes before the thing."]] })]
    }),
    gram("intro", "わたしは〜です", "introducing yourself", {
      note: "わたしは can drop once it's clear who you mean. さん goes after other people's names, never yours.",
      says: [s("わたしは{学生|がくせい}です。", "わたしはがくせいです", "I'm a student."), s("ようたさんは{高校生|こうこうせい}です。", "ようたさんはこうこうせいです", "Yōta is a high school student."), s("わたしはイギリス{人|じん}です。", "わたしはいぎりすじんです", "I'm British.")],
      particles: [{ before: "わたし", after: "{学生|がくせい}です。", en: "I'm a student.", target: "は", options: ["は", "の", "を", "か"],
        wrong: { "の": "わたしの学生 would be “my student”.", "を": "を marks what a verb acts on." } }],
      builds: [build("I'm British.", ["わたしは", "イギリス{人|じん}", "です"], { before: [["a", "b", "The topic (わたしは) comes first."]] })]
    }),
    gram("greet", "はじめまして・よろしく", "meeting someone", {
      note: "Set phrases, said as they are: はじめまして first, your name, then よろしくおねがいします.",
      says: [s("はじめまして。", "はじめまして", "Nice to meet you."), s("はじめまして、ようたです。", "はじめましてようたです", "Nice to meet you, I'm Yōta."), s("よろしくおねがいします。", "よろしくおねがいします", "Nice to meet you — I look forward to knowing you.")],
      builds: [build("Nice to meet you, I'm Akari. Pleased to know you.", ["はじめまして、", "あかりです。", "よろしくおねがいします"], { lastWhy: "よろしくおねがいします closes the introduction.", before: [["a", "b", "はじめまして comes first."]] })]
    })
  ];

  /* ================= 1.3 Yes, no and too ================= */
  var L13 = [
    word("はい", "はい", ["yes"]),
    word("いいえ", "いいえ", ["no"]),
    word("そう", "そう", ["so", "that way", "like that"], { note: "in そうです, “that's right”" }),
    word("ちがいます", "ちがいます", ["that's wrong", "it's different", "no, that's not right"]),
    word("コーヒー", "こーひー", ["coffee"]),
    word("お茶", "おちゃ", ["tea", "green tea"], { ruby: "お{茶|ちゃ}" }),
    word("水", "みず", ["water"], { ruby: "{水|みず}" }),
    word("パン", "ぱん", ["bread"]),
    word("いぬ", "いぬ", ["dog"], { note: "often written 犬" }),
    kanji("水", "みず", "w:水", ["water"], "Water running down the middle, splashing out to each side."),
    gram("ja-nai", "〜じゃないです", "is not", {
      note: "じゃないです is the polite “is not”. ではありません says the same, more formally.",
      says: [s("これはコーヒーじゃないです。", "これはこーひーじゃないです", "This isn't coffee."), s("ようたさんは{先生|せんせい}じゃないです。", "ようたさんはせんせいじゃないです", "Yōta isn't a teacher."), s("それは{水|みず}じゃないです。", "それはみずじゃないです", "That isn't water.")],
      builds: [build("This isn't coffee.", ["これは", "コーヒー", "じゃないです"], { lastWhy: "じゃないです takes the place of です at the end.", before: [["a", "b", "The topic (これは) comes first."]] })]
    }),
    gram("mo", "〜も", "also, too", {
      note: "も takes the place of は (or が, or を): “this TOO”. Never は and も together.",
      says: [s("これもパンです。", "これもぱんです", "This is bread too."), s("わたしも{学生|がくせい}です。", "わたしもがくせいです", "I'm a student too."), s("あれもいぬですか。", "あれもいぬですか", "Is that over there a dog too?")],
      particles: [{ before: "これ", after: "パンです。", en: "This is bread too.", target: "も", options: ["は", "も", "を", "の"], accept: {},
        wrong: { "は": "Grammatical, but the English says “too”: that is も.", "を": "を marks what a verb acts on." } },
        { before: "わたし", after: "{学生|がくせい}です。", en: "I'm a student too.", target: "も", options: ["も", "は", "か", "の"],
          wrong: { "は": "That says “I am a student” — the “too” is も.", "の": "わたしの学生 would be “my student”." } }],
      builds: [build("I'm a student too.", ["わたしも", "{学生|がくせい}", "です"], { before: [["a", "b", "The topic (わたしも) comes first."]] })]
    }),
    gram("sou", "はい、そうです・いいえ、ちがいます", "yes, that's right / no, that's wrong", {
      note: "Answer a です-question with はい、そうです or いいえ、ちがいます — or repeat the noun with じゃないです.",
      says: [s("はい、そうです。", "はいそうです", "Yes, that's right."), s("いいえ、ちがいます。", "いいえちがいます", "No, that's not right."), s("いいえ、お{茶|ちゃ}じゃないです。", "いいえおちゃじゃないです", "No, it isn't tea.")],
      builds: [build("No, it isn't water.", ["いいえ、", "{水|みず}", "じゃないです"], { before: [["a", "b", "いいえ comes first."]] })]
    })
  ];

  /* ================= 1.4 Numbers ================= */
  var NUM = [["一", "いち", 1, "one"], ["二", "に", 2, "two"], ["三", "さん", 3, "three"], ["四", "よん", 4, "four"], ["五", "ご", 5, "five"],
    ["六", "ろく", 6, "six"], ["七", "なな", 7, "seven"], ["八", "はち", 8, "eight"], ["九", "きゅう", 9, "nine"], ["十", "じゅう", 10, "ten"],
    ["百", "ひゃく", 100, "hundred", "a hundred", "one hundred"]];
  var ALT = { "四": ["し"], "七": ["しち"], "九": ["く"] };
  var L14 = [];
  NUM.forEach(function (n) {
    var forms = [{ w: n[0], r: n[1] }, { w: n[1], r: n[1] }].concat((ALT[n[0]] || []).map(function (a) { return { w: a, r: a }; }));
    L14.push(word(n[0], n[1], n.slice(3).concat([String(n[2])]), { ruby: "{" + n[0] + "|" + n[1] + "}", forms: forms, note: ALT[n[0]] ? "also " + ALT[n[0]].join(", ") : null }));
  });
  NUM.forEach(function (n) { L14.push(kanji(n[0], n[1], "w:" + n[0], [n[3]])); });
  L14.push(word("ゼロ", "ぜろ", ["zero", "0"], { note: "also れい" }));
  L14.push(word("なんさい", "なんさい", ["how old", "what age"], { note: "also おいくつ, more politely" }));
  L14.push(gram("tens", "十一〜九十九", "11 to 99", {
    note: "Build them like sums: じゅう + いち is 11, に + じゅう is 20, に + じゅう + ご is 25.",
    says: [s("{十一|じゅういち}", "じゅういち", "eleven"), s("{二十|にじゅう}", "にじゅう", "twenty"), s("{四十五|よんじゅうご}", "よんじゅうご", "forty-five"), s("{九十九|きゅうじゅうきゅう}", "きゅうじゅうきゅう", "ninety-nine")]
  }));
  L14.push(gram("age", "〜さいです", "being N years old", {
    note: "Age is the number plus さい. 1, 8 and 10 change their sound: いっさい, はっさい, じゅっさい.",
    says: [s("ようたさんは{十六|じゅうろく}さいです。", "ようたさんはじゅうろくさいです", "Yōta is 16."), s("わたしは{十七|じゅうなな}さいです。", "わたしはじゅうななさいです", "I'm 17."), s("なんさいですか。", "なんさいですか", "How old are you?")],
    builds: [build("Yōta is 16.", ["ようたさんは", "{十六|じゅうろく}さい", "です"], { before: [["a", "b", "The topic (ようたさんは) comes first."]] })]
  }));

  /* ================= 1.5 Where is it? ================= */
  var L15 = [
    word("ここ", "ここ", ["here", "this place"]),
    word("そこ", "そこ", ["there", "that place"], { note: "near you" }),
    word("あそこ", "あそこ", ["over there", "that place over there"]),
    word("どこ", "どこ", ["where", "which place"]),
    word("駅", "えき", ["station", "train station"], { ruby: "{駅|えき}" }),
    word("トイレ", "といれ", ["toilet", "bathroom", "restroom"]),
    word("出口", "でぐち", ["exit", "way out"], { ruby: "{出|で}{口|ぐち}" }),
    word("入口", "いりぐち", ["entrance", "way in"], { ruby: "{入|いり}{口|ぐち}" }),
    word("ホーム", "ほーむ", ["platform", "station platform"]),
    word("きっぷ", "きっぷ", ["ticket"], { note: "often written 切符" }),
    word("すみません", "すみません", ["excuse me", "sorry"]),
    word("ありがとうございます", "ありがとうございます", ["thank you", "thank you very much"]),
    kanji("口", "ぐち", "w:出口", ["mouth", "opening"], "An open mouth: a square. In 出口 it is the opening you go out of."),
    kanji("出", "で", "w:出口", ["go out", "exit"], "A plant pushing up out of the ground, twice over: going out."),
    kanji("入", "いり", "w:入口", ["enter", "go in"], "A person ducking in through a low doorway."),
    gram("koko", "ここ・そこ・あそこ・どこ", "here / there / over there / where", {
      note: "The これ set for places: ここ near me, そこ near you, あそこ far from both, どこ where?",
      says: [s("ここは{駅|えき}です。", "ここはえきです", "This (place) is the station."), s("トイレはあそこです。", "といれはあそこです", "The toilet is over there."), s("{出口|でぐち}はそこです。", "でぐちはそこです", "The exit is there (near you).")],
      builds: [build("The toilet is over there.", ["トイレは", "あそこ", "です"], { before: [["a", "b", "The topic (トイレは) comes first."]] })]
    }),
    gram("doko", "〜はどこですか", "where is X?", {
      note: "Put the thing you want as the topic, then どこですか. Start with すみません to a stranger.",
      says: [s("トイレはどこですか。", "といれはどこですか", "Where is the toilet?"), s("すみません、{出口|でぐち}はどこですか。", "すみませんでぐちはどこですか", "Excuse me, where is the exit?"), s("ホームはどこですか。", "ほーむはどこですか", "Where is the platform?")],
      particles: [{ before: "トイレ", after: "どこですか。", en: "Where is the toilet?", target: "は", options: ["は", "の", "を", "も"],
        wrong: { "の": "トイレのどこ is “where in the toilet”.", "を": "を marks what a verb acts on." } }],
      builds: [build("Excuse me, where is the exit?", ["すみません、", "{出口|でぐち}は", "どこですか"], { before: [["a", "b", "すみません comes first, to get attention."]] })]
    })
  ];

  /* ================= 1.6 At the café ================= */
  var L16 = [
    word("ください", "ください", ["please give me", "please"], { note: "after the thing you want, with を" }),
    word("いくら", "いくら", ["how much"]),
    word("円", "えん", ["yen"], { ruby: "{円|えん}" }),
    word("紅茶", "こうちゃ", ["black tea", "tea"], { ruby: "{紅茶|こうちゃ}" }),
    word("ジュース", "じゅーす", ["juice"]),
    word("サンドイッチ", "さんどいっち", ["sandwich"]),
    word("メニュー", "めにゅー", ["menu"]),
    word("いらっしゃいませ", "いらっしゃいませ", ["welcome", "come in"], { note: "what staff say when you walk in; you don't answer it" }),
    word("どうぞ", "どうぞ", ["here you are", "please", "go ahead"]),
    word("千", "せん", ["thousand", "a thousand", "1000"], { ruby: "{千|せん}" }),
    kanji("円", "えん", "w:円", ["yen", "circle"], "A round coin seen from the front: yen."),
    kanji("千", "せん", "w:千", ["thousand"], "十 with a stroke on top: ten, lifted to a thousand."),
    gram("kudasai", "〜をください", "X, please", {
      note: "を marks the thing you want; ください asks for it. Said on its own it is perfectly polite.",
      says: [s("コーヒーをください。", "こーひーをください", "Coffee, please."), s("ジュースをください。", "じゅーすをください", "Juice, please."), s("メニューをください。", "めにゅーをください", "The menu, please.")],
      particles: [{ before: "コーヒー", after: "ください。", en: "Coffee, please.", target: "を", options: ["を", "は", "の", "も"],
        accept: { "も": "Grammatical: “coffee too, please”." }, wrong: { "は": "は would make coffee the topic; the thing you ask for takes を.", "の": "の links two nouns." } }],
      builds: [build("A sandwich, please.", ["サンドイッチ", "を", "ください"], { lastWhy: "ください closes the request.", before: [["a", "b", "The thing comes before を."]] })]
    }),
    gram("ikura", "いくらですか・〜円です", "how much is it? / it's N yen", {
      note: "いくら is “how much”; the answer is the number plus 円.",
      says: [s("これはいくらですか。", "これはいくらですか", "How much is this?"), s("ケーキはいくらですか。", "けーきはいくらですか", "How much is the cake?"), s("{四百|よんひゃく}{円|えん}です。", "よんひゃくえんです", "It's 400 yen.")],
      builds: [build("How much is the juice?", ["ジュースは", "いくら", "ですか"], { before: [["a", "b", "The topic (ジュースは) comes first."]] })]
    }),
    gram("hyaku", "三百・六百・八百・三千", "hundreds and thousands", {
      note: "Some hundreds and thousands change their sound: さんびゃく, ろっぴゃく, はっぴゃく, さんぜん, はっせん.",
      says: [s("{三百|さんびゃく}{円|えん}です。", "さんびゃくえんです", "It's 300 yen."), s("{六百|ろっぴゃく}{円|えん}です。", "ろっぴゃくえんです", "It's 600 yen."), s("{八百|はっぴゃく}{円|えん}です。", "はっぴゃくえんです", "It's 800 yen."), s("{三千|さんぜん}{円|えん}です。", "さんぜんえんです", "It's 3,000 yen.")]
    })
  ];

  /* ================= 2.1 What time is it? ================= */
  var L21 = [
    word("今", "いま", ["now"], { ruby: "{今|いま}" }),
    word("時", "じ", ["o'clock", "hour"], { ruby: "{時|じ}", note: "after a number: 三時, three o'clock" }),
    word("何時", "なんじ", ["what time"], { ruby: "{何時|なんじ}" }),
    word("分", "ふん", ["minute", "minutes"], { ruby: "{分|ふん}", forms: [{ w: "分", r: "ふん" }, { w: "ふん", r: "ふん" }, { w: "分", r: "ぷん" }, { w: "ぷん", r: "ぷん" }], note: "ふん or ぷん, by the number before it" }),
    word("半", "はん", ["half past", "half"], { ruby: "{半|はん}" }),
    word("午前", "ごぜん", ["morning", "a.m.", "am"], { ruby: "{午前|ごぜん}" }),
    word("午後", "ごご", ["afternoon", "p.m.", "pm"], { ruby: "{午後|ごご}" }),
    word("ちょうど", "ちょうど", ["exactly", "just"]),
    kanji("今", "いま", "w:今", ["now"], "Under a roof, one moment held still: now."),
    kanji("時", "じ", "w:時", ["time", "hour"], "The sun 日 beside a temple 寺: the temple bell told the time."),
    kanji("分", "ふん", "w:分", ["minute", "divide"], "A knife 刀 cutting something in two: dividing — an hour into minutes."),
    kanji("午", "ご", "w:午前", ["noon"], "A pestle standing upright: the sun straight overhead at noon."),
    kanji("前", "ぜん", "w:午前", ["before", "front"], "In 午前, “before noon”: the morning."),
    kanji("後", "ご", "w:午後", ["after", "behind"], "In 午後, “after noon”: the afternoon."),
    gram("ji", "〜時〜分です", "it's H:MM", {
      note: "The hour is the number plus 時; the minutes the number plus 分. 4, 7 and 9 o'clock are よじ, しちじ and くじ.",
      says: [s("{今|いま}{三時|さんじ}です。", "いまさんじです", "It's three o'clock now."), s("{四時|よじ}{十分|じゅっぷん}です。", "よじじゅっぷんです", "It's ten past four."),
        s("{七時半|しちじはん}です。", "しちじはんです", "It's half past seven."), s("{九時|くじ}{五分|ごふん}です。", "くじごふんです", "It's five past nine.")],
      builds: [build("It's ten past four now.", ["{今|いま}", "{四時|よじ}", "{十分|じゅっぷん}", "です"], { before: [["b", "c", "The hour comes before the minutes."]] })]
    }),
    gram("nanji", "何時ですか", "what time is it?", {
      note: "何時 asks the hour. No “it” is needed: 今何時ですか is the whole question.",
      says: [s("{今|いま}{何時|なんじ}ですか。", "いまなんじですか", "What time is it now?"), s("すみません、{今|いま}{何時|なんじ}ですか。", "すみませんいまなんじですか", "Excuse me, what time is it?"),
        s("ちょうど{二時|にじ}です。", "ちょうどにじです", "It's exactly two.")],
      builds: [build("Excuse me, what time is it now?", ["すみません、", "{今|いま}", "{何時|なんじ}", "ですか"], { before: [["a", "b", "すみません comes first."]] })]
    }),
    gram("gozen", "午前・午後", "a.m. / p.m.", {
      note: "午前 and 午後 go BEFORE the time, never after it.",
      says: [s("{午前|ごぜん}{十時|じゅうじ}です。", "ごぜんじゅうじです", "It's 10 a.m."), s("{午後|ごご}{一時半|いちじはん}です。", "ごごいちじはんです", "It's 1:30 p.m."),
        s("{午後|ごご}{六時|ろくじ}です。", "ごごろくじです", "It's 6 p.m.")],
      builds: [build("It's 1:30 p.m.", ["{午後|ごご}", "{一時半|いちじはん}", "です"], { before: [["a", "b", "午後 comes before the time."]] })]
    })
  ];

  /* ================= 2.2 Days of the week ================= */
  var DAYS = [["月曜日", "げつようび", "monday"], ["火曜日", "かようび", "tuesday"], ["水曜日", "すいようび", "wednesday"], ["木曜日", "もくようび", "thursday"],
    ["金曜日", "きんようび", "friday"], ["土曜日", "どようび", "saturday"], ["日曜日", "にちようび", "sunday"]];
  var L22 = DAYS.map(function (d) { return word(d[0], d[1], [d[2]], { ruby: "{" + d[0] + "|" + d[1] + "}" }); }).concat([
    word("何曜日", "なんようび", ["what day of the week", "what day", "which day"], { ruby: "{何曜日|なんようび}" }),
    word("今日", "きょう", ["today"], { ruby: "{今日|きょう}" }),
    word("あした", "あした", ["tomorrow"], { note: "often written 明日" }),
    word("きのう", "きのう", ["yesterday"], { note: "often written 昨日" }),
    kanji("月", "げつ", "w:月曜日", ["moon", "month"], "A crescent moon with two lines across it. Monday is the moon's day."),
    kanji("火", "か", "w:火曜日", ["fire"], "A fire with sparks flying from each side."),
    kanji("木", "もく", "w:木曜日", ["tree", "wood"], "A tree: trunk, branches and roots."),
    kanji("金", "きん", "w:金曜日", ["gold", "money"], "Nuggets of gold under a roof in the ground. Friday is gold's day."),
    kanji("土", "ど", "w:土曜日", ["earth", "soil"], "A shoot coming up out of the ground."),
    gram("youbi", "〜は〜曜日です", "it's (a day)", {
      note: "Every day ends in 曜日 (ようび). 何曜日 asks which.",
      says: [s("{今日|きょう}は{月曜日|げつようび}です。", "きょうはげつようびです", "Today is Monday."), s("あしたは{金曜日|きんようび}です。", "あしたはきんようびです", "Tomorrow is Friday."),
        s("{今日|きょう}は{何曜日|なんようび}ですか。", "きょうはなんようびですか", "What day is it today?")],
      particles: [{ before: "{今日|きょう}", after: "{水曜日|すいようび}です。", en: "Today is Wednesday.", target: "は", options: ["は", "を", "の", "か"],
        wrong: { "を": "を marks what a verb acts on.", "の": "今日の水曜日 would be “today's Wednesday”.", "か": "か goes at the very end." } }],
      builds: [build("Tomorrow is Saturday.", ["あしたは", "{土曜日|どようび}", "です"], { before: [["a", "b", "The topic (あしたは) comes first."]] })]
    }),
    gram("deshita", "〜でした", "was", {
      note: "でした is the past of です. Its negative is じゃなかったです.",
      says: [s("きのうは{日曜日|にちようび}でした。", "きのうはにちようびでした", "Yesterday was Sunday."), s("きのうは{火曜日|かようび}じゃなかったです。", "きのうはかようびじゃなかったです", "Yesterday wasn't Tuesday."),
        s("きのうは{何曜日|なんようび}でしたか。", "きのうはなんようびでしたか", "What day was it yesterday?")],
      builds: [build("Yesterday was Thursday.", ["きのうは", "{木曜日|もくようび}", "でした"], { lastWhy: "でした, the past of です, closes the sentence.", before: [["a", "b", "The topic (きのうは) comes first."]] })]
    })
  ]);

  /* ================= 2.3 From … to … ================= */
  var L23 = [
    word("から", "から", ["from"], { note: "after the starting point: 九時から" }),
    word("まで", "まで", ["until", "to", "till"], { note: "after the end point: 五時まで" }),
    word("学校", "がっこう", ["school"], { ruby: "{学校|がっこう}" }),
    word("じゅぎょう", "じゅぎょう", ["class", "lesson"], { note: "often written 授業" }),
    word("昼休み", "ひるやすみ", ["lunch break"], { ruby: "{昼休|ひるやす}み" }),
    word("休み", "やすみ", ["day off", "holiday", "break", "closed"], { ruby: "{休|やす}み" }),
    word("毎日", "まいにち", ["every day", "daily"], { ruby: "{毎日|まいにち}" }),
    word("カフェ", "かふぇ", ["café", "cafe", "coffee shop"]),
    kanji("学", "がっ", "w:学校", ["study", "learning"], "A child 子 under a roof, learning. がく shortens to がっ before こ."),
    kanji("校", "こう", "w:学校", ["school"], "Wood 木 beside a meeting place: a schoolhouse."),
    kanji("休", "やす", "w:休み", ["rest"], "A person 亻 leaning on a tree 木: resting."),
    kanji("毎", "まい", "w:毎日", ["every"], "A mother 母 with a hat on, every single day."),
    gram("kara-made", "〜から〜まで", "from X to Y", {
      note: "から follows the start, まで the end. Either can stand alone.",
      says: [s("{九時|くじ}から{五時|ごじ}までです。", "くじからごじまでです", "It's from nine to five."),
        s("じゅぎょうは{月曜日|げつようび}から{金曜日|きんようび}までです。", "じゅぎょうはげつようびからきんようびまでです", "Classes are from Monday to Friday."),
        s("{昼休|ひるやす}みは{十二時|じゅうにじ}から{一時|いちじ}までです。", "ひるやすみはじゅうにじからいちじまでです", "Lunch break is from twelve to one.")],
      particles: [
        { before: "{九時|くじ}", after: "{五時|ごじ}までです。", en: "It's from nine to five.", target: "から", options: ["から", "まで", "は", "の"],
          wrong: { "まで": "まで marks the end; the start takes から.", "は": "は marks a topic, not a starting time.", "の": "の links two nouns." } },
        { before: "{九時|くじ}から{五時|ごじ}", after: "です。", en: "It's from nine to five.", target: "まで", options: ["まで", "から", "を", "も"],
          wrong: { "から": "から marks the start; the end takes まで.", "を": "を marks what a verb acts on.", "も": "も means “too”." } }],
      builds: [build("Lunch break is from twelve to one.", ["{昼休|ひるやす}みは", "{十二時|じゅうにじ}から", "{一時|いちじ}まで", "です"],
        { before: [["a", "b", "The topic comes first."], ["b", "c", "The start (から) comes before the end (まで)."]] })]
    }),
    gram("kara", "〜からです・〜までです", "starts at / goes on until", {
      note: "Xは〜からです: X starts at …. Xは〜までです: X goes on until ….",
      says: [s("じゅぎょうは{九時|くじ}からです。", "じゅぎょうはくじからです", "Class starts at nine."), s("カフェは{午前|ごぜん}{八時|はちじ}からです。", "かふぇはごぜんはちじからです", "The café opens at 8 a.m."),
        s("{学校|がっこう}は{四時|よじ}までです。", "がっこうはよじまでです", "School goes on until four.")],
      builds: [build("Class starts at nine.", ["じゅぎょうは", "{九時|くじ}から", "です"], { before: [["a", "b", "The topic (じゅぎょうは) comes first."]] })]
    }),
    gram("yasumi", "〜は休みです", "X is a day off / closed", {
      note: "休み is a day off, a break, or a shop being closed.",
      says: [s("{日曜日|にちようび}は{休|やす}みです。", "にちようびはやすみです", "Sunday is a day off."), s("きのうは{休|やす}みでした。", "きのうはやすみでした", "Yesterday was a day off."),
        s("{今日|きょう}は{休|やす}みですか。", "きょうはやすみですか", "Is today a day off?")],
      builds: [build("Sunday is a day off.", ["{日曜日|にちようび}は", "{休|やす}み", "です"], { before: [["a", "b", "The topic comes first."]] })]
    })
  ];

  /* ================= 2.4 Dates and birthdays ================= */
  var L24 = [
    word("何月", "なんがつ", ["what month", "which month"], { ruby: "{何月|なんがつ}" }),
    word("何日", "なんにち", ["what date", "what day of the month"], { ruby: "{何日|なんにち}" }),
    word("一日", "ついたち", ["the first", "1st", "the 1st"], { ruby: "{一日|ついたち}", note: "as a date; いちにち is “one day”" }),
    word("二日", "ふつか", ["the second", "2nd", "the 2nd", "two days"], { ruby: "{二日|ふつか}" }),
    word("三日", "みっか", ["the third", "3rd", "the 3rd", "three days"], { ruby: "{三日|みっか}" }),
    word("四日", "よっか", ["the fourth", "4th", "the 4th", "four days"], { ruby: "{四日|よっか}" }),
    word("五日", "いつか", ["the fifth", "5th", "the 5th", "five days"], { ruby: "{五日|いつか}" }),
    word("八日", "ようか", ["the eighth", "8th", "the 8th", "eight days"], { ruby: "{八日|ようか}" }),
    word("十日", "とおか", ["the tenth", "10th", "the 10th", "ten days"], { ruby: "{十日|とおか}" }),
    word("二十日", "はつか", ["the twentieth", "20th", "the 20th", "twenty days"], { ruby: "{二十日|はつか}" }),
    word("いつ", "いつ", ["when"]),
    word("たんじょうび", "たんじょうび", ["birthday"], { note: "often written 誕生日" }),
    kanji("何", "なん", "w:何月", ["what"], "A person 亻 beside a question: what? Read なん before a counter, なに on its own."),
    gram("gatsu", "〜月〜日です", "it's (a date)", {
      note: "The month is its number plus 月 (がつ): 四月 is しがつ, 七月 しちがつ, 九月 くがつ. The day comes after the month.",
      says: [s("{今日|きょう}は{四月|しがつ}{十日|とおか}です。", "きょうはしがつとおかです", "Today is the 10th of April."), s("{七月|しちがつ}{二十日|はつか}です。", "しちがつはつかです", "It's the 20th of July."),
        s("{九月|くがつ}{一日|ついたち}です。", "くがつついたちです", "It's the 1st of September."), s("{今日|きょう}は{何月|なんがつ}{何日|なんにち}ですか。", "きょうはなんがつなんにちですか", "What's the date today?")],
      builds: [build("Today is the 1st of September.", ["{今日|きょう}は", "{九月|くがつ}", "{一日|ついたち}", "です"],
        { before: [["a", "b", "The topic comes first."], ["b", "c", "The month comes before the day."]] })]
    }),
    gram("hi", "一日〜十日・二十日", "the days of the month", {
      note: "The 1st to the 10th, the 14th, 20th and 24th have their own words. The rest are the number plus 日 (にち): 十一日 is じゅういちにち.",
      says: [s("{一日|ついたち}", "ついたち", "the 1st"), s("{二日|ふつか}", "ふつか", "the 2nd"), s("{八日|ようか}", "ようか", "the 8th"), s("{二十日|はつか}", "はつか", "the 20th"),
        s("{十九日|じゅうくにち}", "じゅうくにち", "the 19th")]
    }),
    gram("itsu", "〜はいつですか", "when is X?", {
      note: "いつ asks “when”; answer with a day, a date or a time.",
      says: [s("たんじょうびはいつですか。", "たんじょうびはいつですか", "When is your birthday?"),
        s("わたしのたんじょうびは{五月|ごがつ}{三日|みっか}です。", "わたしのたんじょうびはごがつみっかです", "My birthday is the 3rd of May."),
        s("{休|やす}みはいつからですか。", "やすみはいつからですか", "When does the holiday start?")],
      particles: [{ before: "たんじょうび", after: "いつですか。", en: "When is your birthday?", target: "は", options: ["は", "を", "の", "も"],
        wrong: { "を": "を marks what a verb acts on.", "の": "たんじょうびのいつ is not Japanese.", "も": "も means “too”." } }],
      builds: [build("When is your birthday?", ["たんじょうびは", "いつ", "ですか"], { before: [["a", "b", "The topic (たんじょうびは) comes first."]] })]
    })
  ];

  /* ================= 2.5 The next train ================= */
  var L25 = [
    word("でんしゃ", "でんしゃ", ["train"], { note: "often written 電車" }),
    word("バス", "ばす", ["bus"]),
    word("つぎ", "つぎ", ["next"], { note: "つぎの〜: the next 〜" }),
    word("ごろ", "ごろ", ["about", "around"], { note: "after a time: 三時ごろ" }),
    word("東京", "とうきょう", ["tokyo"], { ruby: "{東京|とうきょう}" }),
    word("行き", "ゆき", ["bound for", "going to"], { ruby: "{行|ゆ}き", forms: [{ w: "行き", r: "ゆき" }, { w: "ゆき", r: "ゆき" }, { w: "行き", r: "いき" }, { w: "いき", r: "いき" }], note: "after a place: 東京行き; also いき" }),
    word("番線", "ばんせん", ["track number", "platform number", "track"], { ruby: "{番線|ばんせん}" }),
    word("何番線", "なんばんせん", ["which platform", "which track", "what track number"], { ruby: "{何番線|なんばんせん}" }),
    kanji("東", "とう", "w:東京", ["east"], "The sun 日 rising behind a tree 木: the east."),
    kanji("京", "きょう", "w:東京", ["capital"], "A tall building on a hill: the capital."),
    kanji("行", "ゆ", "w:行き", ["go"], "A crossroads: going. In 行き it reads ゆ (or い)."),
    kanji("番", "ばん", "w:番線", ["number", "turn"], "A field 田 with seeds scattered in turn: a number in a row."),
    gram("tsugi", "つぎの〜は〜です", "the next X is …", {
      note: "つぎ joins its noun with の: つぎのでんしゃ, the next train.",
      says: [s("つぎのでんしゃは{三時十五分|さんじじゅうごふん}です。", "つぎのでんしゃはさんじじゅうごふんです", "The next train is at 3:15."),
        s("つぎのバスは{何時|なんじ}ですか。", "つぎのばすはなんじですか", "What time is the next bus?"), s("つぎは{東京|とうきょう}です。", "つぎはとうきょうです", "The next stop is Tokyo.")],
      particles: [{ before: "つぎ", after: "でんしゃは{何時|なんじ}ですか。", en: "What time is the next train?", target: "の", options: ["の", "は", "を", "か"],
        wrong: { "は": "つぎは would make “next” the topic; “the next train” is つぎのでんしゃ.", "を": "を marks what a verb acts on.", "か": "か goes at the very end." } }],
      builds: [build("What time is the next bus?", ["つぎの", "バスは", "{何時|なんじ}", "ですか"], { before: [["a", "b", "つぎの comes before the thing it describes."]] })]
    }),
    gram("goro", "〜ごろ", "about (a time)", {
      note: "ごろ after a time makes it approximate: 三時ごろ, about three.",
      says: [s("{三時|さんじ}ごろです。", "さんじごろです", "It's about three."), s("でんしゃは{七時半|しちじはん}ごろです。", "でんしゃはしちじはんごろです", "The train is around 7:30."),
        s("{午後|ごご}{五時|ごじ}ごろです。", "ごごごじごろです", "Around five in the afternoon.")],
      builds: [build("The train is around 7:30.", ["でんしゃは", "{七時半|しちじはん}", "ごろ", "です"], { before: [["a", "b", "The topic comes first."], ["b", "c", "ごろ follows the time."]] })]
    }),
    gram("yuki", "〜行き・〜番線", "bound for X / platform N", {
      note: "A train is named by where it goes: 東京行き. Platforms are numbered 番線.",
      says: [s("{東京|とうきょう}{行|ゆ}きは{二番線|にばんせん}です。", "とうきょうゆきはにばんせんです", "Trains for Tokyo leave from platform 2."),
        s("{東京|とうきょう}{行|ゆ}きは{何番線|なんばんせん}ですか。", "とうきょうゆきはなんばんせんですか", "Which platform for Tokyo?"),
        s("つぎの{東京|とうきょう}{行|ゆ}きは{四時|よじ}です。", "つぎのとうきょうゆきはよじです", "The next train for Tokyo is at four.")],
      builds: [build("Which platform for Tokyo?", ["{東京|とうきょう}{行|ゆ}きは", "{何番線|なんばんせん}", "ですか"], { before: [["a", "b", "The topic comes first."]] })]
    })
  ];

  /* ================= 2.6 Phone numbers ================= */
  var L26 = [
    word("電話", "でんわ", ["phone", "telephone", "phone call"], { ruby: "{電話|でんわ}" }),
    word("番号", "ばんごう", ["number"], { ruby: "{番号|ばんごう}" }),
    word("電話番号", "でんわばんごう", ["phone number", "telephone number"], { ruby: "{電話番号|でんわばんごう}" }),
    word("何番", "なんばん", ["what number", "which number"], { ruby: "{何番|なんばん}" }),
    word("もしもし", "もしもし", ["hello", "hello (on the phone)"], { note: "on the phone only" }),
    word("けいたい", "けいたい", ["mobile phone", "mobile", "cell phone"], { note: "often written 携帯" }),
    word("じゃあ、また", "じゃあまた", ["see you", "see you later", "bye"], { note: "a casual goodbye; また means “again”" }),
    kanji("電", "でん", "w:電話", ["electricity"], "Rain 雨 over a field, with lightning: electricity."),
    kanji("話", "わ", "w:電話", ["talk", "speak"], "Words 言 from a tongue 舌: talking."),
    kanji("号", "ごう", "w:番号", ["number", "sign"], "A mouth 口 calling out a number."),
    gram("bangou", "電話番号は何番ですか", "what's your number?", {
      note: "A phone number is read digit by digit, and each dash is read の. 0 is ゼロ (or まる).",
      says: [s("{電話番号|でんわばんごう}は{何番|なんばん}ですか。", "でんわばんごうはなんばんですか", "What's your phone number?"),
        s("ゼロきゅうゼロの、いちにさんよんの、ごろくななはちです。", "ぜろきゅうぜろのいちにさんよんのごろくななはちです", "It's 090-1234-5678."),
        s("けいたいの{番号|ばんごう}は{何番|なんばん}ですか。", "けいたいのばんごうはなんばんですか", "What's your mobile number?")],
      particles: [{ before: "{電話番号|でんわばんごう}", after: "{何番|なんばん}ですか。", en: "What's your phone number?", target: "は", options: ["は", "を", "の", "か"],
        wrong: { "を": "を marks what a verb acts on.", "の": "電話番号の何番 is not Japanese.", "か": "か goes at the very end." } }],
      builds: [build("What's your mobile number?", ["けいたいの", "{番号|ばんごう}は", "{何番|なんばん}", "ですか"], { before: [["a", "b", "けいたいの comes before 番号."]] })]
    }),
    gram("moshimoshi", "もしもし・じゃあ、また", "on the phone", {
      note: "もしもし opens a call (and checks the line); じゃあ、また closes it between friends.",
      says: [s("もしもし、あかりです。", "もしもしあかりです", "Hello, it's Akari."), s("もしもし、ようたさんですか。", "もしもしようたさんですか", "Hello, is that Yōta?"),
        s("じゃあ、また{金曜日|きんようび}。", "じゃあまたきんようび", "See you Friday, then.")],
      builds: [build("Hello, is that Yōta?", ["もしもし、", "ようたさん", "ですか"], { before: [["a", "b", "もしもし comes first."]] })]
    })
  ];

  /* ================= the unit ================= */
  function lesson(id, title, can, items, produce) {
    var unit = "F" + id.split(".")[0];
    J.LESSONS[id] = { id: id, unit: unit, title: title, can: can, items: items, produce: produce };
    return id;
  }
  var F1 = [
    lesson("1.1", "This, that and that over there", "Point at things and name them: これ・それ・あれ with は and です, and ask what something is.",
      L11, ["w:これ", "w:それ", "w:あれ", "w:本", "w:ケーキ", "w:なん"]),
    lesson("1.2", "Nice to meet you", "Introduce yourself and ask someone's name; join nouns with の.",
      L12, ["w:わたし", "w:はじめまして", "w:よろしくおねがいします", "w:名前", "w:学生", "w:日本人"]),
    lesson("1.3", "Yes, no and too", "Answer yes or no, say what something isn't, and add “too” with も.",
      L13, ["w:はい", "w:いいえ", "w:コーヒー", "w:お茶", "w:水"]),
    lesson("1.4", "Numbers to 100 and ages", "Count to 99, read 一 to 十 and 百, and say how old you are.",
      L14, ["w:一", "w:二", "w:三", "w:四", "w:五", "w:十"]),
    lesson("1.5", "Where is it?", "Ask where something is at a station and understand ここ・そこ・あそこ.",
      L15, ["w:ここ", "w:どこ", "w:駅", "w:トイレ", "w:すみません", "w:ありがとうございます"]),
    lesson("1.6", "At the café", "Order with をください, ask the price and understand it in yen.",
      L16, ["w:ください", "w:いくら", "w:円", "w:ジュース"])
  ];
  var F2 = [
    lesson("2.1", "What time is it?", "Ask and tell the time: 時, 分 and 半, with 午前 and 午後.",
      L21, ["w:今", "w:時", "w:何時", "w:分", "w:半"]),
    lesson("2.2", "Days of the week", "Name the days, say what day it is, and what day it was with でした.",
      L22, ["w:月曜日", "w:金曜日", "w:日曜日", "w:今日", "w:あした", "w:きのう"]),
    lesson("2.3", "From … to …", "Say when something starts and ends with から and まで, and when a place is closed.",
      L23, ["w:から", "w:まで", "w:学校", "w:休み", "w:毎日"]),
    lesson("2.4", "Dates and birthdays", "Say a date, ask when something is with いつ, and give your birthday.",
      L24, ["w:何月", "w:何日", "w:一日", "w:いつ", "w:たんじょうび"]),
    lesson("2.5", "The next train", "Ask when the next train leaves and from which platform; say “about” a time.",
      L25, ["w:でんしゃ", "w:バス", "w:つぎ", "w:ごろ"]),
    lesson("2.6", "Phone numbers", "Give and take a phone number, and open and close a call.",
      L26, ["w:電話", "w:電話番号", "w:何番", "w:もしもし"])
  ];
  var s1 = J.STAGES.filter(function (st) { return st.id === "s1"; })[0];
  s1.units.push({ id: "F1", name: "First conversations", lessons: F1, checkpoint: "cp-F1",
    can: { R: "Read a café menu's prices and a station's signs.", L: "Follow a self-introduction and a price said aloud.", W: "Write an introduction and an order.", S: "Introduce yourself and order (when speaking is on)." } });
  J.CHECKPOINTS["cp-F1"] = { id: "cp-F1", unit: "F1", title: "First conversations checkpoint", skills: ["R", "W", "L"] };
  s1.units.push({ id: "F2", name: "Days and times", lessons: F2, checkpoint: "cp-F2",
    can: { R: "Read a time, a date, opening hours and a train's platform.", L: "Catch a time, a day and a phone number said aloud.", W: "Write a time, a date, and when something starts and ends.", S: "Ask the time and give your number (when speaking is on)." } });
  J.CHECKPOINTS["cp-F2"] = { id: "cp-F2", unit: "F2", title: "Days and times checkpoint", skills: ["R", "W", "L"] };

  J.spine();
})();
